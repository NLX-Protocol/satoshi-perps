const fs = require('fs')
const path = require('path')
const parse = require('csv-parse')

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

const ARBITRUM = 42161
const AVALANCHE = 43114

const {
  ARBITRUM_URL,
  AVAX_URL,
  ARBITRUM_DEPLOY_KEY,
  AVAX_DEPLOY_KEY
} = require("../../env.json");
const { ethers, upgrades } = require('hardhat');

const providers = {
  arbitrum: new ethers.providers.JsonRpcProvider(ARBITRUM_URL),
  avax: new ethers.providers.JsonRpcProvider(AVAX_URL)
}

const signers = {
  arbitrum: new ethers.Wallet(ARBITRUM_DEPLOY_KEY).connect(providers.arbitrum),
  avax: new ethers.Wallet(ARBITRUM_DEPLOY_KEY).connect(providers.avax)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const readCsv = async (file) => {
  records = []
  const parser = fs
    .createReadStream(file)
    .pipe(parse({ columns: true, delimiter: ',' }))
  parser.on('error', function (err) {
    console.error(err.message)
  })
  for await (const record of parser) {
    records.push(record)
  }
  return records
}

function getChainId(network) {
  if (network === "arbitrum") {
    return 42161
  }

  if (network === "avax") {
    return 43114
  }

  throw new Error("Unsupported network")
}

async function getFrameSigner(options) {
  try {
    const frame = new ethers.providers.JsonRpcProvider("http://127.0.0.1:1248")
    const signer = frame.getSigner()
    let networkToCheck = network
    if (options && options.network) {
      networkToCheck = options.network
    }
    if (getChainId(networkToCheck) !== await signer.getChainId()) {
      throw new Error("Incorrect frame network")
    }
    return signer
  } catch (e) {
    throw new Error(`getFrameSigner error: ${e.toString()}`)
  }
}

async function sendTxn(txnPromise, label) {
  console.info(`Processsing ${label}:`)
  const txn = await txnPromise
  console.info(`Sending ${label}...`)
  await txn.wait(2)
  console.info(`... Sent! ${txn.hash}`)
  return txn
}

async function callWithRetries(func, args, retriesCount = 3) {
  let i = 0
  while (true) {
    i++
    try {
      return await func(...args)
    } catch (ex) {
      if (i === retriesCount) {
        console.error("call failed %s times. throwing error", retriesCount)
        throw ex
      }
      console.error("call i=%s failed. retrying....", i)
      console.error(ex.message)
    }
  }
}

async function deployContract(name, args, label, options) {

  if (!options && typeof label === "object") {
    label = null
    options = label
  }

  let info = name
  if (label) { info = name + ":" + label }

  const contractFactoryOptions = {}
  if (options?.libraries) {
    contractFactoryOptions.libraries = options.libraries
  }

  const contractFactory = await ethers.getContractFactory(name, contractFactoryOptions)
  let contract



  if (options) {
    delete options.libraries
    contract = await contractFactory.deploy(...args, options)
  } else {
    contract = await contractFactory.deploy(...args)
  }
  const argStr = args.map((i) => `"${i}"`).join(" ")
  console.info(`Deploying ${info} ${contract.address} ${argStr}`)
  await contract.deployTransaction.wait()
  console.info("... Completed!")

  // Verify the contract after deployment
  try {
    console.log("Verifying contract...");

    await hre.run("verify:verify", {
      address: contract.address,
      constructorArguments: args,
    });

    console.info("Contract verified successfully!");
  } catch (err) {
    console.error("Verification failed:", err);
  }


  return contract
}

async function deployUpgradeableContract(name, args, label, options) {
  if (!options && typeof label === "object") {
    label = null;
    options = label;
  }

  let info = name;
  if (label) { info = name + ":" + label; }

  const contractFactoryOptions = {};
  if (options?.libraries) {
    contractFactoryOptions.libraries = options.libraries;
  }

  // Deploy custom ProxyAdmin if specified
  let proxyAdmin;
  if (options?.proxyAdmin) {
    try {
      console.info(`Deploying custom ProxyAdmin (${options.proxyAdmin})...`);
      const ProxyAdminFactory = await ethers.getContractFactory(options.proxyAdmin);
      proxyAdmin = await ProxyAdminFactory.deploy();
      await proxyAdmin.deployed();
      console.info(`Custom ProxyAdmin deployed at ${proxyAdmin.address}`);

      // Verify ProxyAdmin contract
      try {
        console.log("Verifying ProxyAdmin contract...");
        await hre.run("verify:verify", {
          address: proxyAdmin.address,
          constructorArguments: []
        });
        console.info("ProxyAdmin contract verified successfully!");
      } catch (err) {
        console.error("ProxyAdmin verification failed:", err);
      }
    } catch (error) {
      console.error("ProxyAdmin deployment failed:", error);
      throw error;
    }
  }

  // Get main contract factory and deploy implementation
  const contractFactory = await ethers.getContractFactory(name, contractFactoryOptions);
  let proxy;
  let implementation;

  try {
    // First deploy the implementation contract
    implementation = await contractFactory.deploy();
    await implementation.deployed();
    console.info(`Implementation deployed at ${implementation.address}`);

    // Verify the implementation contract
    try {
      console.log("Verifying implementation contract...");
      await hre.run("verify:verify", {
        address: implementation.address,
        constructorArguments: []
      });
      console.info("Contract implementation verified successfully!");
    } catch (err) {
      console.error("Implementation verification failed:", err);
    }


    if (proxyAdmin) {
      // Deploy TransparentUpgradeableProxy with empty initialization data
      const ProxyFactory = await ethers.getContractFactory("TransparentUpgradeableProxy");
      
      proxy = await ProxyFactory.deploy(
        implementation.address,
        proxyAdmin.address,
        "0x" // Empty initialization data
      );
      await proxy.deployed();
      
      console.info(`Proxy deployed at ${proxy.address}`);
      console.info(`Using custom ProxyAdmin at ${proxyAdmin.address}`);

      // Verify the proxy contract
      try {
        console.log("Verifying proxy contract...");
        await hre.run("verify:verify", {
          address: proxy.address,
          constructorArguments: [
            implementation.address,
            proxyAdmin.address,
            "0x"
          ]
        });
        console.info("Proxy contract verified successfully!");
      } catch (err) {
        console.error("Proxy verification failed:", err);
      }
    } else {
      // Use standard upgrades deployment
      const deployOptions = {
        initializer: false,
        kind: 'transparent',
        ...(options || {})
      };
      
      proxy = await upgrades.deployProxy(contractFactory, args, deployOptions);
      await proxy.deployed();

      // Verify the proxy contract
      try {
        console.log("Verifying proxy contract...");
        await hre.run("verify:verify", {
          address: proxy.address,
          constructorArguments: []
        });
        console.info("Proxy contract verified successfully!");
      } catch (err) {
        console.error("Proxy verification failed:", err);
      }
    }

    const argStr = args.map((i) => `"${i}"`).join(" ");
    console.info(`Deployed Upgradeable ${info} ${proxy.address} ${argStr}`);
    
    // Log final addresses
    const adminAddress = await upgrades.erc1967.getAdminAddress(proxy.address);
    const implAddress = await upgrades.erc1967.getImplementationAddress(proxy.address);
    console.info(`Final Addresses:`);
    console.info(`- Proxy: ${proxy.address}`);
    console.info(`- Implementation: ${implAddress}`);
    console.info(`- ProxyAdmin: ${adminAddress}`);

    // Create a contract instance attached to the proxy address
    const contract = contractFactory.attach(proxy.address);

    // Return all deployed contracts and addresses
    return {
      proxy: contract,              // Main contract instance (attached to proxy)
      proxyAddress: proxy.address,  // Proxy contract address
      implementation,               // Implementation contract instance
      implementationAddress: implementation.address, // Implementation contract address
      proxyAdmin,                  // ProxyAdmin contract instance (if custom)
      proxyAdminAddress: proxyAdmin ? proxyAdmin.address : adminAddress // ProxyAdmin address
    };
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}
async function verifyUpgradeable(contract, constructorArguments = undefined) {
  // Verify the contract after deployment
  if (constructorArguments) {
    try {
      console.log("Verifying contract...");

      await hre.run("verify:verify", {
        address: contract,
        constructorArguments,
      });

      console.info("Contract verified successfully!");
    } catch (err) {
      console.error("Verification failed:", err);
    }

  } else {

    try {
      console.log("Verifying contract...");

      await hre.run("verify:verify", {
        address: contract,
        constructorArguments: [],
      });

      console.info("Contract verified successfully!");
    } catch (err) {
      console.error("Verification failed:", err);
    }
  }

  return
}

async function contractAt(name, address, provider = undefined, options) {

  const contractFactoryOptions = {}
  if (options?.libraries) {
    contractFactoryOptions.libraries = options.libraries
  }
  let contractFactory = await ethers.getContractFactory(name, contractFactoryOptions)
  if (provider) {
    contractFactory = contractFactory.connect(provider)
  }
  return await contractFactory.attach(address)
}

const tmpAddressesFilepath = path.join(__dirname, '..', '..', `.tmp-addresses-${process.env.HARDHAT_NETWORK}.json`)

function readTmpAddresses() {
  if (fs.existsSync(tmpAddressesFilepath)) {
    return JSON.parse(fs.readFileSync(tmpAddressesFilepath))
  }
  return {}
}

function writeTmpAddresses(json) {
  const tmpAddresses = Object.assign(readTmpAddresses(), json)
  fs.writeFileSync(tmpAddressesFilepath, JSON.stringify(tmpAddresses))
}

// batchLists is an array of lists
async function processBatch(batchLists, batchSize, handler) {
  let currentBatch = []
  const referenceList = batchLists[0]

  for (let i = 0; i < referenceList.length; i++) {
    const item = []

    for (let j = 0; j < batchLists.length; j++) {
      const list = batchLists[j]
      item.push(list[i])
    }

    currentBatch.push(item)

    if (currentBatch.length === batchSize) {
      console.log("handling currentBatch", i, currentBatch.length, referenceList.length)
      await handler(currentBatch)
      currentBatch = []
    }
  }

  if (currentBatch.length > 0) {
    console.log("handling final batch", currentBatch.length, referenceList.length)
    await handler(currentBatch)
  }
}

async function updateTokensPerInterval(distributor, tokensPerInterval, label) {
  const prevTokensPerInterval = await distributor.tokensPerInterval()
  if (prevTokensPerInterval.eq(0)) {
    // if the tokens per interval was zero, the distributor.lastDistributionTime may not have been updated for a while
    // so the lastDistributionTime should be manually updated here
    await sendTxn(distributor.updateLastDistributionTime({ gasLimit: 1_000_000 }), `${label}.updateLastDistributionTime`)
  }
  await sendTxn(distributor.setTokensPerInterval(tokensPerInterval, { gasLimit: 1_000_000 }), `${label}.setTokensPerInterval`)
}

module.exports = {
  ARBITRUM,
  AVALANCHE,
  providers,
  signers,
  readCsv,
  getFrameSigner,
  sendTxn,
  deployContract,
  deployUpgradeableContract,
  verifyUpgradeable,
  contractAt,
  writeTmpAddresses,
  readTmpAddresses,
  callWithRetries,
  processBatch,
  updateTokensPerInterval,
  sleep
}

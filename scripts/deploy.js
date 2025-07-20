async function main() {

  const GhostFormF = await hre.ethers.getContractFactory("GhostForm");
  const ghostform = await GhostFormF.deploy();

  await ghostform.waitForDeployment();
  
  const deployedAddress = await ghostform.getAddress();
  console.log(`GhostForm deployed to: ${deployedAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import hre from "hardhat";

async function main() {
    console.log("🔍 Investigating Hardhat Runtime Environment");
    console.log("HRE keys:", Object.keys(hre));
    console.log("HRE ethers type:", typeof hre.ethers);
    
    if (hre.ethers) {
        console.log("Ethers keys:", Object.keys(hre.ethers));
        console.log("Has getSigners:", typeof hre.ethers.getSigners);
        
        if (hre.ethers.getSigners) {
            try {
                const signers = await hre.ethers.getSigners();
                console.log("Signers count:", signers.length);
                console.log("First signer:", signers[0].address);
            } catch (error) {
                console.log("Error getting signers:", error.message);
            }
        }
    } else {
        console.log("❌ hre.ethers is not available");
    }
}

main().catch(console.error);
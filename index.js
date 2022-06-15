import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdraButton = document.getElementById("withdrawButton")
balanceButton.onclick = getBalance
connectButton.onclick = connection
fundButton.onclick = fund
withdraButton.onclick = withdraw
/*connecting to metamask*/
async function connection() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected!"
    } else {
        connectButton.innerHTML = "Install metamask!"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log("balanace = ", ethers.utils.formatEther(balance))
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`funding with ${ethAmount}`)
    if (typeof window.ethereum !== "undefined") {
        //console.log("sono nell'if")
        //search for the http endpoint in metamask, so the network to which it is connected
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //console.log(`provider ${provider}`)
        //getting the signer -> the account connected+
        const signer = provider.getSigner() //--> returns the wallet connected
        //console.log("signer ", signer)
        const contract = new ethers.Contract(contractAddress, abi, signer)
        //console.log("Contract ", contract)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            //console.log("Transaction response ", transactionResponse)
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log("errore ", error)
        }
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionRecepeit) => {
            console.log(
                `Completed with ${transactionRecepeit.confirmations} confirmations`
            )
            resolve()
        })
    })
}

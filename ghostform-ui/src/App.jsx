import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "./constants";
import ghostFormAbi from "./abi/GhostForm.json"; // ✅ ABI

// ⬇️ Replace with your deployed contract address
const contractAddress = CONTRACT_ADDRESS;

function App() {
  const [wallet, setWallet] = useState(null);
  const [contract, setContract] = useState(null);
  const [lifespan, setLifespan] = useState(5); // in minutes
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
    setWallet(account);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(contractAddress, ghostFormAbi.abi, signer);
    setContract(contract);
  };

  const createWallet = async () => {
    const tx = await contract.createGhostWallet(lifespan);
    await tx.wait();
    setStatus("🎭 Ghost Wallet Created!");
    setTimeout(() => setStatus(""), 5000);
    fetchTimeLeft();
  };

  const postAnonMessage = async () => {
    const tx = await contract.postMessage(message);
    await tx.wait();
    setStatus("📩 Message Posted!");
    setTimeout(() => setStatus(""), 5000);
    setMessage("");
  };

  const destroyWallet = async () => {
    const tx = await contract.selfDestruct();
    await tx.wait();
    setStatus("💀 Ghost Wallet Destroyed.");
    setTimeout(() => setStatus(""), 5000);
    setTimeLeft(null);
  };
  const [walletStatus, setWalletStatus] = useState(null);

const getWalletStatus = async () => {
  try {
    const gw = await contract.ghostWallets(wallet); // Access mapping
    setWalletStatus({
      used: gw.used,
      expiryTime: parseInt(gw.expiryTime.toString())
    });
  } catch {
    setWalletStatus(null);
  }
};

  const fetchTimeLeft = async () => {
    try {
      const remaining = await contract.timeLeft();
      setTimeLeft(parseInt(remaining.toString()));
    } catch {
      setTimeLeft(null);
    }
  };
  const fetchCreatedAt = async () => {
  try {
    const timestamp = await contract.getCreatedAt();
    const date = new Date(parseInt(timestamp.toString()) * 1000);
    setCreatedAt(date);
  } catch {
    setCreatedAt(null);
  }
};


useEffect(() => {
  if (wallet && contract) {
    fetchTimeLeft();
    getWalletStatus();
    const interval = setInterval(() => {
      fetchTimeLeft();
      getWalletStatus();
    }, 10000);
    return () => clearInterval(interval);
  }
}, [wallet, contract]);



  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-purple-500 mb-6">👻 GhostForm</h1>

      {!wallet ? (
        <button onClick={connectWallet} className="bg-purple-600 px-6 py-2 rounded hover:bg-purple-700">
          Connect Wallet
        </button>
      ) : (
        <div className="w-full max-w-md space-y-4">

          <p className="text-sm text-gray-400">🔗 Connected: {wallet}</p>

          <div className="bg-zinc-800 p-4 rounded">
            <label className="block mb-1">Wallet Lifespan (minutes):</label>
            <input
              type="number"
              value={lifespan}
              onChange={(e) => setLifespan(e.target.value)}
              className="w-full p-2 rounded bg-zinc-700 text-white"
            />
            <button onClick={createWallet} className="bg-green-600 w-full py-2 rounded mt-2 hover:bg-green-700">
              🎭 Create Ghost Wallet
            </button>
          </div>

          {timeLeft !== null && (
            <div className="text-center text-yellow-300">
              ⏳ Time Left: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
            </div>
          )}
          <button onClick={async () => {
            const walletTime = await contract.timeLeft();
            alert(`⏳ Time left: ${walletTime.toString()} seconds`);
          }}
            className="bg-indigo-500 w-full py-2 rounded hover:bg-indigo-600"
        >
          🔍 Check Time Left
        </button>

        {walletStatus && (
  <div className="text-sm text-gray-300 text-center">
    <p>✅ Wallet Created: {new Date(walletStatus.expiryTime * 1000).toLocaleString()}</p>
    <p>🧾 Message Used: {walletStatus.used ? "Yes" : "No"}</p>
  </div>
)}


          <div className="bg-zinc-800 p-4 rounded space-y-2">
            <label className="block">Post Anonymous Message:</label>
            <textarea
              className="w-full p-2 rounded bg-zinc-700"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <button onClick={postAnonMessage} className="bg-blue-500 w-full py-2 rounded hover:bg-blue-600">
              📩 Post Message
            </button>
          </div>

          <button onClick={destroyWallet} className="bg-red-600 w-full py-2 rounded hover:bg-red-700">
            💀 Burn Ghost Wallet
          </button>


          {status && <p className="text-green-400 text-center mt-2">{status}</p>}
        </div>
      )}
    </div>
  );
}

export default App;

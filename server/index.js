const secp = require("ethereum-cryptography/secp256k1");
const { sha256 } = require("ethereum-cryptography/sha256");

const { toHex, hexToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());


const numberOfWallets = 3;
const walletKeys = initNumberOfWalletKeys(numberOfWallets);
const balances = initWalletBalances(walletKeys)

function initNumberOfWalletKeys(number) {
  let keys = [];
  for (let i = 0; i < number; i++) {
    keys.push(toHex(secp.utils.randomPrivateKey()));
  }
  return keys;
}

function initWalletBalances(keys) {
  let balances = new Object();
  for (let i = 0; i < keys.length; i++) {
    let address = toHex(getAddress(getPublicKey(hexToBytes(keys[i]))));
    balances[address] = Math.floor(Math.random() * 100);
  }
  return balances;
}

function getPublicKey(key) {
  return secp.getPublicKey(key);
}

function getAddress(publicKey) {
  return keccak256(publicKey.slice(1)).slice(-20)
}

console.log("Wallet keys: ", walletKeys);
console.log("Wallet balances: ", balances);

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature } = req.body;

  const message = sender.toString() + recipient.toString() + amount.toString();
  const messageHash = toHex(sha256(new TextEncoder("utf-8").encode(message)));

  const signatureHex = signature.slice(1);
  const recoveryNumber = parseInt(signature.slice(0, 1));

  const recoveredPublicKey = secp.recoverPublicKey(messageHash, signatureHex, recoveryNumber);
  const isSigned = secp.verify(signature.slice(1), messageHash, recoveredPublicKey);
  
  if (!isSigned) {
    res.status(400).send({ message: "Wrong signature" });
    return;
  }

  const senderFromSignature = toHex(getAddress(recoveredPublicKey));

  if (sender !== senderFromSignature) {
    res.status(400).send({ message: "Sender mismatch!" });
    return;
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });

    console.log("Wallet balances: ", balances);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

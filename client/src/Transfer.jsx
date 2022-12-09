import { useState } from "react";
import server from "./server";
import { toHex } from "ethereum-cryptography/utils";
import { sha256 } from "ethereum-cryptography/sha256";


function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [dataToSign, setDataToSign] = useState("");
  const [signature, setSignature] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function onRecipientChange(evt) {
    const recipient = evt.target.value;
    setRecipient(recipient);
    if (address && sendAmount && recipient) {
      let dataToSign = address.toString() + recipient.toString() + sendAmount.toString();
      setDataToSign(toHex(sha256(new TextEncoder("utf-8").encode(dataToSign))));
    } else {
      setDataToSign("");
    }
  }

  async function onSendAmountChange(evt) {
    const sendAmount = evt.target.value;
    setSendAmount(sendAmount);
    if (address && sendAmount && recipient) {
      let dataToSign = address.toString() + recipient.toString() + sendAmount.toString();
      setDataToSign(toHex(sha256(new TextEncoder("utf-8").encode(dataToSign))));
    } else {
      setDataToSign("");
    }
  }
  
  async function transfer(evt) {
    evt.preventDefault();

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={onSendAmountChange}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={onRecipientChange}
        ></input>
      </label>

      <label>
        Data to sign
        <div className="data-to-sign">{dataToSign}</div>
      </label>

      <label>
        Signature
        <input
          placeholder="Add transfer signature"
          value={signature}
          onChange={setValue(setSignature)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;

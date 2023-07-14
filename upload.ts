import { create } from "ipfs-http-client";


const projectId = "<API_KEY>";
const projectSecret = "<API_KEY_SECRET>";
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

console.log(client);

import { ProxyAgent } from "undici";

// Webshare proxies

const proxies = [
  "198.23.239.134:6540:nyptkusb:h8xyjns5p8uc",
  "207.244.217.165:6712:nyptkusb:h8xyjns5p8uc",
  "107.172.163.27:6543:nyptkusb:h8xyjns5p8uc",
  "64.137.42.112:5157:nyptkusb:h8xyjns5p8uc",
  "173.211.0.148:6641:nyptkusb:h8xyjns5p8uc",
  "161.123.152.115:6360:nyptkusb:h8xyjns5p8uc",
  "167.160.180.203:6754:nyptkusb:h8xyjns5p8uc",
  "154.36.110.199:6853:nyptkusb:h8xyjns5p8uc",
  "173.0.9.70:5653:nyptkusb:h8xyjns5p8uc",
  "173.0.9.209:5792:nyptkusb:h8xyjns5p8uc",
];

export function getProxyAgent() {
  const proxy = proxies[Math.floor(Math.random() * proxies.length)]!;
  const [host, port, username, password] = proxy.split(":");
  return new ProxyAgent(`http://${username}:${password}@${host}:${port}`);
}

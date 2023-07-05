const networkConfig = {
  80001: {
    /**
     * reference:
     * (RelayHub、Forwarder)
     * https://docs.opengsn.org/networks/polygon/mumbai.html
     * (Relay)
     * https://relays.opengsn.org/
     */
    name: "mumbai",
    RelayHub: "0x3232f21A6E08312654270c78A773f00dd61d60f5",
    Forwarder: "0xB2b5841DBeF766d4b521221732F9B618fCf34A87",
    Relay: "0x6fae20662d026a775487edf62f4aed94272dbb9e",
  },
};

module.exports = {
  networkConfig,
};

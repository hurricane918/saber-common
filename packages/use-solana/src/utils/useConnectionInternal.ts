import type {
  Network,
  NetworkConfig,
  NetworkConfigMap,
} from "@saberhq/solana-contrib";
import { DEFAULT_NETWORK_CONFIG_MAP } from "@saberhq/solana-contrib";
import type { Commitment } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import { useMemo } from "react";

import { useLocalStorageState } from "./useLocalStorageState";

export type PartialNetworkConfigMap = {
  [N in Network]?: Partial<NetworkConfig>;
};

export interface ConnectionContext {
  connection: Connection;
  sendConnection: Connection;
  network: Network;
  setNetwork: (val: Network) => void;
  endpoint: string;
  setEndpoints: (endpoints: Omit<NetworkConfig, "name">) => void;
}

const makeNetworkConfigMap = (
  partial: PartialNetworkConfigMap
): NetworkConfigMap =>
  Object.entries(DEFAULT_NETWORK_CONFIG_MAP).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [k as Network]: {
        ...v,
        ...partial[k as Network],
      },
    }),
    DEFAULT_NETWORK_CONFIG_MAP
  );

export interface ConnectionArgs {
  defaultNetwork?: Network;
  networkConfigs?: PartialNetworkConfigMap;
  commitment?: Commitment;
}

/**
 * Handles the connection to the Solana nodes.
 * @returns
 */
export const useConnectionInternal = ({
  // default to mainnet-beta
  defaultNetwork = "mainnet-beta",
  networkConfigs = DEFAULT_NETWORK_CONFIG_MAP,
  commitment = "recent",
}: ConnectionArgs): ConnectionContext => {
  const [network, setNetwork] = useLocalStorageState<Network>(
    "use-solana/network",
    defaultNetwork
  );
  const configMap = makeNetworkConfigMap(networkConfigs);
  const config = configMap[network];
  const [{ endpoint, endpointWs }, setEndpoints] = useLocalStorageState<
    Omit<NetworkConfig, "name">
  >("use-solana/rpc-endpoint", config);

  const connection = useMemo(
    () =>
      new Connection(endpoint, {
        commitment,
        wsEndpoint: endpointWs,
      }),
    [commitment, endpoint, endpointWs]
  );
  const sendConnection = useMemo(
    () =>
      new Connection(endpoint, {
        commitment,
        wsEndpoint: endpointWs,
      }),
    [commitment, endpoint, endpointWs]
  );

  return {
    connection,
    sendConnection,
    network,
    setNetwork,
    endpoint,
    setEndpoints,
  };
};

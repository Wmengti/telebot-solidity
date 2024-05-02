/*
 * @Author: Wmengti 0x3ceth@gmail.com
 * @LastEditTime: 2023-10-14 13:22:30
 * @Description:
 */
/*
 * @Author: Wmengti 0x3ceth@gmail.com
 * @LastEdit Time: 2023-07-10 18:30:34
 * @Description:
 */
const getPoolImmutables = async (poolContract) => {
  const [token0, token1, fee] = await Promise.all([poolContract.token0(), poolContract.token1(), poolContract.fee()]);
  const immutables = { token0: token0, token1: token1, fee: fee };
  return immutables;
};

const getPoolState = async (poolContract) => {
  const slot = await poolContract.slot0();

  const state = {
    sqrtPriceX96: slot[0],
  };
  return state;
};

module.exports = { getPoolImmutables, getPoolState };

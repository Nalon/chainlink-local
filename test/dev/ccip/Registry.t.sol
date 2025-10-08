// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, Vm} from "forge-std/Test.sol";
import {CCIPLocalSimulatorFork, Register} from "../../../src/ccip/CCIPLocalSimulatorFork.sol";

contract TokenTransferorFork is Test {
    CCIPLocalSimulatorFork public ccipLocalSimulatorFork;


    function setUp() public {
   
        ccipLocalSimulatorFork = new CCIPLocalSimulatorFork();

    }

    function test_forkTokenTransfer() external {
            ccipLocalSimulatorFork.getNetworkDetails(80002);

    }
}

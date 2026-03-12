#!/usr/bin/env node
import { Command } from "commander";
import { balanceCmd } from "./commands/balance";
import { preflightSendCmd } from "./commands/preflight-send";
import { sendCmd } from "./commands/send";
import "dotenv/config";

const program = new Command();

program
  .name("tonalli")
  .description("CLI Soberano para la Civilización Tonalli de xolosArmy")
  .version("0.1.0");

program.addCommand(balanceCmd);
program.addCommand(preflightSendCmd);
program.addCommand(sendCmd);

program.parse(process.argv);

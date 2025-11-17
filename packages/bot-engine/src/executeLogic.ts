import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import type { LogicBlock } from "@typebot.io/blocks-logic/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { Prisma } from "@typebot.io/prisma/types";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { SetVariableHistoryItem } from "@typebot.io/variables/schemas";
import { executeAbTest } from "./blocks/logic/abTest/executeAbTest";
import { executeAddTagBlock } from "./blocks/logic/addTag/executeAddTagBlock";
import { executeConditionBlock } from "./blocks/logic/condition/executeConditionBlock";
import { executeGetContactBlock } from "./blocks/logic/getContact/executeGetContactBlock";
import { executeJumpBlock } from "./blocks/logic/jump/executeJumpBlock";
import { executeRedirect } from "./blocks/logic/redirect/executeRedirect";
import { executeRemoveTagBlock } from "./blocks/logic/removeTag/executeRemoveTagBlock";
import { executeReturnBlock } from "./blocks/logic/return/executeReturnBlock";
import { executeScript } from "./blocks/logic/script/executeScript";
import { executeSetContactBlock } from "./blocks/logic/setContact/executeSetContactBlock";
import { executeSetVariable } from "./blocks/logic/setVariable/executeSetVariable";
import { executeTypebotLink } from "./blocks/logic/typebotLink/executeTypebotLink";
import { executeWait } from "./blocks/logic/wait/executeWait";
import { executeWebhookBlock } from "./blocks/logic/webhook/executeWebhookBlock";
import type { ExecuteLogicResponse } from "./types";

export const executeLogic = async ({
  block,
  state,
  sessionStore,
  setVariableHistory,
  visitedEdges,
}: {
  block: LogicBlock;
  state: SessionState;
  setVariableHistory: SetVariableHistoryItem[];
  sessionStore: SessionStore;
  visitedEdges: Prisma.VisitedEdge[];
}): Promise<ExecuteLogicResponse> => {
  switch (block.type) {
    case LogicBlockType.SET_VARIABLE:
      return executeSetVariable(block, {
        state,
        setVariableHistory,
        sessionStore,
        visitedEdges,
      });
    case LogicBlockType.CONDITION:
      return executeConditionBlock(block, { state, sessionStore });
    case LogicBlockType.REDIRECT:
      return executeRedirect(block, { state, sessionStore });
    case LogicBlockType.SCRIPT:
      return executeScript(block, { state, sessionStore });
    case LogicBlockType.TYPEBOT_LINK:
      return executeTypebotLink(block, { state, sessionStore });
    case LogicBlockType.WAIT:
      return executeWait(block, { state, sessionStore });
    case LogicBlockType.JUMP:
      return executeJumpBlock(block, { state, sessionStore });
    case LogicBlockType.AB_TEST:
      return executeAbTest(block);
    case LogicBlockType.WEBHOOK:
      return executeWebhookBlock(block);
    case LogicBlockType.RETURN:
      return executeReturnBlock(state);
    case LogicBlockType.GET_CONTACT:
      return executeGetContactBlock(block, { state, sessionStore });
    case LogicBlockType.SET_CONTACT:
      return executeSetContactBlock(block, { state, sessionStore });
    case LogicBlockType.ADD_TAG:
      return executeAddTagBlock(block, { state, sessionStore });
    case LogicBlockType.REMOVE_TAG:
      return executeRemoveTagBlock(block, { state, sessionStore });
  }
};

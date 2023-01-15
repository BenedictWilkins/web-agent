import { VWSpeakAction } from "../../actions/VWSpeakAction";
import { VWActionOutcome } from "../../common/VWActionOutcome";
import { VWActionResult } from "../../common/VWActionResult";
import { VWEnvironment } from "../VWEnvironment";
import { VWAbstractExecutor } from "./VWAbstractExecutor";

export class VWSpeakExecutor extends VWAbstractExecutor {
    protected isPossible(action: VWSpeakAction, env: VWEnvironment): boolean {
        try {
            return this.isActorInEnv(action.getActorID(), env) && env.getActorByID(action.getActorID()).orElseThrow().getCommunicativeActuator().isPresent();
        }
        catch (e) {
            return false;
        }
    }

    protected perform(action: VWSpeakAction, env: VWEnvironment): VWActionResult {
        try {
            if (env.sendMessageToRecipients(action)) {
                return new VWActionResult(VWActionOutcome.SUCCESS, action);
            }
            else {
                return new VWActionResult(VWActionOutcome.FAILURE, action);
            }
        }
        catch (e) {
            return new VWActionResult(VWActionOutcome.FAILURE, action);
        }
    }

    protected succeeded(action: VWSpeakAction, env: VWEnvironment): boolean {
        try {
            return this.checkInvariants(action, env); // No check here for a successful message delivery.
        }
        catch (e) {
            return false;
        }
    }

    protected checkInvariants(action: VWSpeakAction, env: VWEnvironment): boolean {
        return this.checkAllInvariants(action, env);
    }
}

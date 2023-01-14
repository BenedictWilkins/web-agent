import { VWAction } from "../../actions/VWAction";
import { VWMessage } from "../../common/VWMessage";
import { VWObservation } from "../../common/VWObservation";
import { VWMind } from "./VWMind";
import { VWMindCore } from "./core/VWMindCore";

export abstract class VWAbstractMind implements VWMind {
    private core: VWMindCore;
    private nextActions: VWAction[];

    public perceive(observation: VWObservation, messages: VWMessage[]): void {
        this.core.perceive(observation, messages);
    }

    public revise(): void {
        this.core.revise();
    }

    public decide(): void {
        this.nextActions = this.core.decide();
    }

    public execute(): VWAction[] {
        return this.nextActions;
    }
}

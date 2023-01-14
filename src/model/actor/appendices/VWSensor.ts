import { VWPerception } from "../../common/VWPerception";

export interface VWSensor<P extends VWPerception> {
    sink(perception: P) : void;

    sinkAll(perceptions: P[]) : void;

    source() : P;

    sourceAll() : P[];
}

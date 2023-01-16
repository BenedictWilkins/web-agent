import { VWActor } from "../actor/VWActor";
import { JOptional } from "../common/JOptional";
import { VWCoord } from "../common/VWCoord";
import { VWDirection } from "../common/VWDirection";
import { VWDirt } from "../dirt/VWDirt";
import { VWLocation } from "./VWLocation";

export class VWAmbient {
    private grid: Map<VWCoord, VWLocation>;

    public constructor(grid: Map<VWCoord, VWLocation>) {
        this.grid = VWAmbient.validateGrid(grid);
    }

    private static validateGrid(grid: Map<VWCoord, VWLocation>): Map<VWCoord, VWLocation> {
        if (grid == null || grid == undefined) {
            throw new Error("The grid cannot be null or undefined.");
        }
        else {
            return grid;
        }
    }

    public getGrid(): Map<VWCoord, VWLocation> {
        return this.grid;
    }

    public getLocation(coord: VWCoord): JOptional<VWLocation> {
        return JOptional.ofNullable(this.grid.get(coord));
    }

    public getActorsIDs(): string[] {
        const actorIDs: string[] = [];

        for (let [_, location] of this.grid) {
            const actor = location.getActor();

            if (actor.isPresent()) {
                actorIDs.push(actor.orElseThrow().getID());
            }
        }

        return actorIDs;
    }

    public getActorByID(id: string): JOptional<VWActor> {
        for (let [_, location] of this.grid) {
            const actor = location.getActor();

            if (actor.isPresent() && actor.orElseThrow().getID() === id) {
                return actor;
            }
        }

        return JOptional.empty();
    }

    public getActorByCoord(coord: VWCoord): JOptional<VWActor> {
        return this.getLocation(coord).flatMap(location => location.getActor());
    }

    public getActorCoordByID(id: string): JOptional<VWCoord> {
        for (let [coord, location] of this.grid) {
            const actor = location.getActor();

            if (actor.isPresent() && actor.orElseThrow().getID() === id) {
                return JOptional.of(coord);
            }
        }

        return JOptional.empty();
    }

    public addActorToLocation(coord: VWCoord, actor: VWActor): void {
        if (coord == null || coord == undefined) {
            throw new Error("The coordinates of the location cannot be null or undefined.");
        }
        else if (actor == null || actor == undefined) {
            throw new Error("The actor cannot be null or undefined.");
        }
        else if (this.getActorByCoord(coord).isPresent()) {
            throw new Error("There is already an actor at the location.");
        }
        else {
            this.getLocation(coord).ifPresent(location => location.addActor(actor));
        }
    }

    public popActorByCoord(coord: VWCoord): JOptional<VWActor> {
        return this.getLocation(coord).flatMap(location => location.popActor());
    }

    public moveActor(from: VWCoord, to: VWCoord): void {
        if (from == null || from == undefined) {
            throw new Error("The coordinates of the origin location cannot be null or undefined.");
        }
        else if (to == null || to == undefined) {
            throw new Error("The coordinates of the destination location cannot be null or undefined.");
        }
        else if (from.equals(to)) {
            throw new Error("The destination location cannot be the same as the origin location.");
        }
        else if (!this.getActorByCoord(from).isPresent()) {
            throw new Error("There is no actor at the origin location.");
        }
        else if (this.getActorByCoord(to).isPresent()) {
            throw new Error("There is already an actor at the destination location.");
        }
        else {
            const actor = this.popActorByCoord(from).orElseThrow();
            const location = this.getLocation(to).orElseThrow();

            location.addActor(actor);
        }
    }

    public turnActor(coord: VWCoord, direction: VWDirection): void {
        if (coord == null || coord == undefined) {
            throw new Error("The coordinates of the actor location cannot be null or undefined.");
        }
        else if (!this.getActorByCoord(coord).isPresent()) {
            throw new Error("There is no actor at the origin location.");
        }
        else {
            const actor = this.getActorByCoord(coord).orElseThrow();

            actor.turn(direction);
        }
    }

    public getDirtsIDs(): string[] {
        const dirtIDs: string[] = [];

        for (let [_, location] of this.grid) {
            const dirt = location.getDirt();

            if (dirt.isPresent()) {
                dirtIDs.push(dirt.orElseThrow().getID());
            }
        }

        return dirtIDs;
    }

    public getDirtByID(id: string): JOptional<VWDirt> {
        for (let [_, location] of this.grid) {
            const dirt = location.getDirt();

            if (dirt.isPresent() && dirt.orElseThrow().getID() === id) {
                return dirt;
            }
        }

        return JOptional.empty();
    }

    public getDirtByCoord(coord: VWCoord): JOptional<VWDirt> {
        return this.getLocation(coord).flatMap(location => location.getDirt());
    }

    public getDirtCoordByID(id: string): JOptional<VWCoord> {
        for (let [coord, location] of this.grid) {
            const dirt = location.getDirt();

            if (dirt.isPresent() && dirt.orElseThrow().getID() === id) {
                return JOptional.of(coord);
            }
        }

        return JOptional.empty();
    }

    public cleanDirtByCoord(coord: VWCoord): void {
        if (coord == null || coord == undefined) {
            throw new Error("The coordinates of the dirt location cannot be null or undefined.");
        }
        else if (!this.getDirtByCoord(coord).isPresent()) {
            throw new Error("There is no dirt at the location.");
        }
        else {
            const location = this.getLocation(coord).orElseThrow();

            location.removeDirt();
        }
    }

    public addDirtToLocation(coord: VWCoord, dirt: VWDirt): void {
        if (coord == null || coord == undefined) {
            throw new Error("The coordinates of the location cannot be null or undefined.");
        }
        else if (dirt == null || dirt == undefined) {
            throw new Error("The dirt cannot be null or undefined.");
        }
        else if (this.getDirtByCoord(coord).isPresent()) {
            throw new Error("There is already a dirt at the location.");
        }
        else {
            this.getLocation(coord).ifPresent(location => location.addDirt(dirt));
        }
    }
}
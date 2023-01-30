import { VWBroadcastAction } from "../../../actions/VWBroadcastAction";
import { VWCleanAction } from "../../../actions/VWCleanAction";
import { VWDropDirtAction } from "../../../actions/VWDropDirtAction";
import { VWIdleAction } from "../../../actions/VWIdleAction";
import { VWMoveAction } from "../../../actions/VWMoveAction";
import { VWSpeakAction } from "../../../actions/VWSpeakAction";
import { VWTurnAction } from "../../../actions/VWTurnAction";
import { VWEnvironment } from "../../../environment/VWEnvironment";
import { VWExistenceChecker } from "../../../utils/VWExistenceChecker";
import { VWErrorDiv } from "../../common/VWErrorDiv";
import { VWDiv } from "../../common/VWDiv";
import { VWOptions } from "../../common/VWOptions";
import { VWInitialViewDiv } from "../../initial/div/VWInitialDiv";
import { VWInitialViewButtonsDiv } from "../../initial/div/VWInitialViewButtonsDiv";
import { VWOptionsDialogDiv } from "../../initial/div/VWOptionsDialogDiv";
import { VWDraggableBodiesDiv } from "../../simulation/div/VWDraggableBodiesDiv";
import { VWGridDiv } from "../../simulation/div/VWGridDiv";
import { VWInternalSimulationControlsDiv } from "../../simulation/div/VWInternalSimulationControlsDiv";
import { VWSimulation } from "../../simulation/div/VWSimulation";

export class VWPlatformDiv implements VWDiv {
    private div: HTMLDivElement; // Will have ID "platform_div";
    private initialViewDiv: VWInitialViewDiv; // Shown by default;
    private initialViewButtonsDiv: VWInitialViewButtonsDiv; // Shown by default;
    private optionsDialogDiv: VWOptionsDialogDiv; // Hidden by default;
    private gridDiv: VWGridDiv; // Hidden by default;
    private simulationControlsDiv: VWInternalSimulationControlsDiv; // Hidden by default;
    private options: VWOptions;
    private simulation: VWSimulation;
    private packed: boolean;

    public constructor(initialViewImgPath: string) {
        if (!VWExistenceChecker.exists(initialViewImgPath)) {
            throw new Error("The path of the initial view image cannot be null or undefined.");
        }
        else {
            this.div = document.createElement("div");
            this.div.id = "platform_div";
            this.div.classList.add("center-aligned");
            this.div.hidden = true;
            this.initialViewDiv = new VWInitialViewDiv(initialViewImgPath);
            this.initialViewButtonsDiv = new VWInitialViewButtonsDiv(this.start.bind(this), this.showOptionsDialog.bind(this), this.guide);
            this.optionsDialogDiv = new VWOptionsDialogDiv(this.saveNewOptions.bind(this), this.discardNewOptions.bind(this), this.loadState.bind(this), this.loadTeleora.bind(this));
            this.gridDiv = new VWGridDiv();
            this.simulationControlsDiv = new VWInternalSimulationControlsDiv();
            this.options = new VWOptions();
            this.packed = false;
        }
    }

    private showOptionsDialog(): void {
        if (!VWExistenceChecker.exists(this.optionsDialogDiv)) {
            throw new Error("Cannot show the options dialog div: it is null or undefined.");
        }
        else {
            this.optionsDialogDiv.pack();
            this.optionsDialogDiv.show();
        }
    }

    private loadState(): void {
        const file = (<HTMLInputElement>document.getElementById("state_to_load_upload_input")).files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            this.options.setStateToLoad(JSON.parse(<string>e.target.result));
        }

        reader.readAsText(file);
    }

    private loadTeleora(): void {
        const file = (<HTMLInputElement>document.getElementById("teleora_upload_input")).files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            this.options.setTeleora(<string>e.target.result); // TODO: parse teleora file.
        }

        reader.readAsText(file);
    }

    private start(): void {
        try {
            this.setActionEfforts();

            // TODO: load the appropriate config.
            const config: object = {
                "initial_environment_dim": 8,
                "min_environment_dim": 3,
                "max_environment_dim": 13
            };

            if (this.options.isAutoplayActive()) {
                this.run(config, true);
            }
            else {
                this.run(config, false);
            }
        }
        catch (e) {
            VWErrorDiv.displayError(e);

            console.error(e);
        }
    }

    private run(config: object, autoplay: boolean): void {
        let environment: VWEnvironment = VWEnvironment.newEnvironment(this.options, config, this.options.getStateToLoad());

        this.simulation = new VWSimulation(environment, this.options, config);

        this.simulation.setCallbacks(this.replaceGridDiv.bind(this), this.hideDraggableBodiesDiv.bind(this), this.replaceDraggableBodiesDiv.bind(this), this.hideSimulationControlsDiv.bind(this), this.replaceSimulationControlsDiv.bind(this));

        this.initialViewDiv.hide();
        this.initialViewButtonsDiv.hide();
        this.initialViewDiv.unpack();
        this.initialViewButtonsDiv.unpack();

        this.showExternalSimulationControls();

        // TODO: show the internal user difficulty toggle button.
        // TODO: change the displayed buttons, and add the appropriate listeners.

        if (autoplay) {
            this.simulation.cycleSimulation();
        }
        else {
            this.simulation.showSimulation();
        }
    }

    private showExternalSimulationControls(): void {
        document.getElementById("external_simulation_controls_div").hidden = false;

        this.showStoppedSimulationControls();

        document.getElementById("external_run_button").addEventListener("click", () => {
            this.showRunningSimulationControls();
            // TODO: hide the internal user difficulty toggle button.

            this.simulation.cycleSimulation();
        });

        document.getElementById("external_stop_button").addEventListener("click", () => {
            this.showStoppedSimulationControls();
            // TODO: show slider.
            // TODO: show the internal user difficulty toggle button.

            this.simulation.stop();
            this.simulation.getEnvironment().resetAndMaintainElements();

            this.simulation = new VWSimulation(this.simulation.getEnvironment(), this.options, this.simulation.getConfig());

            this.simulation.setCallbacks(this.replaceGridDiv.bind(this), this.hideDraggableBodiesDiv.bind(this), this.replaceDraggableBodiesDiv.bind(this), this.hideSimulationControlsDiv.bind(this), this.replaceSimulationControlsDiv.bind(this));
            this.simulation.showSimulation();
        });

        document.getElementById("external_pause_button").addEventListener("click", () => {
            this.showPausedSimulationControls();

            this.simulation.pause();
        });

        document.getElementById("external_resume_button").addEventListener("click", () => {
            this.showRunningSimulationControls();

            this.simulation.resume();
        });

        document.getElementById("external_speed_button").addEventListener("click", () => {
            this.options.setSpeed(Math.max(0.999, this.options.getSpeed() + 0.1));
        });

        document.getElementById("external_reset_button").addEventListener("click", () => {
            this.showStoppedSimulationControls();

            this.simulation.stop();

            this.simulation = new VWSimulation(VWEnvironment.newEmptyVWEnvironment(this.simulation.getConfig()), this.options, this.simulation.getConfig());

            this.simulation.setCallbacks(this.replaceGridDiv.bind(this), this.hideDraggableBodiesDiv.bind(this), this.replaceDraggableBodiesDiv.bind(this), this.hideSimulationControlsDiv.bind(this), this.replaceSimulationControlsDiv.bind(this));
            this.simulation.showSimulation();
        });

        document.getElementById("external_guide_button").addEventListener("click", this.guide);

        // TODO: add listeners to the save and load buttons.
    }

    private showRunningSimulationControls(): void {
        document.getElementById("external_run_button").hidden = true;
        document.getElementById("external_pause_button").hidden = false;
        document.getElementById("external_resume_button").hidden = true;
        document.getElementById("external_stop_button").hidden = false;
        document.getElementById("external_reset_button").hidden = true;
        document.getElementById("external_speed_button").hidden = false;
        document.getElementById("external_save_button").hidden = true;
        document.getElementById("external_load_button").hidden = true;
        document.getElementById("external_guide_button").hidden = true;

        this.showTooltips();
    }

    private showStoppedSimulationControls(): void {
        document.getElementById("external_run_button").hidden = false;
        document.getElementById("external_pause_button").hidden = true;
        document.getElementById("external_resume_button").hidden = true;
        document.getElementById("external_stop_button").hidden = true;
        document.getElementById("external_reset_button").hidden = false;
        document.getElementById("external_speed_button").hidden = true;
        document.getElementById("external_save_button").hidden = false;
        document.getElementById("external_load_button").hidden = false;
        document.getElementById("external_guide_button").hidden = false;

        this.showTooltips();
    }

    private showPausedSimulationControls(): void {
        document.getElementById("external_run_button").hidden = true;
        document.getElementById("external_pause_button").hidden = true;
        document.getElementById("external_resume_button").hidden = false;
        document.getElementById("external_stop_button").hidden = false;
        document.getElementById("external_reset_button").hidden = true;
        document.getElementById("external_speed_button").hidden = true;
        document.getElementById("external_save_button").hidden = true;
        document.getElementById("external_load_button").hidden = true;
        document.getElementById("external_guide_button").hidden = true;

        this.showTooltips();
    }

    private showTooltips(): void {
        if (this.options.areTooltipsActive()) {
            document.getElementById("external_run_button").title = "Run the simulation.";
            document.getElementById("external_pause_button").title = "Pause the simulation.";
            document.getElementById("external_resume_button").title = "Resume the simulation.";
            document.getElementById("external_stop_button").title = "Stop the simulation.";
            document.getElementById("external_reset_button").title = "Reset the simulation.";
            document.getElementById("external_speed_button").title = "Increase the simulation speed.";
            document.getElementById("external_save_button").title = "Save the environment to a JSON file.";
            document.getElementById("external_load_button").title = "Load the environment from a JSON file.";
            document.getElementById("external_guide_button").title = "Show the guide in the browser.";
        }
    }

    private replaceGridDiv(newGridDiv: VWGridDiv): void {
        if (!VWExistenceChecker.exists(newGridDiv)) {
            throw new Error("Cannot replace the grid div: the new grid div is null or undefined.");
        }
        else {
            this.div.replaceChild(newGridDiv.getDiv(), this.gridDiv.getDiv());
            this.gridDiv = newGridDiv;
        }
    }

    private hideDraggableBodiesDiv(): void {
        VWExistenceChecker.validateExistence(this.gridDiv, "The grid div cannot be null or undefined.");
        VWExistenceChecker.validateExistence(this.gridDiv.getDraggableBodiesDiv(), "The draggable bodies div cannot be null or undefined.");

        this.gridDiv.getDraggableBodiesDiv().hide();
    }

    private replaceDraggableBodiesDiv(gridSize: number): void {
        VWExistenceChecker.validateExistence(gridSize, "The grid size cannot be null or undefined.");
        VWExistenceChecker.validateExistence(this.gridDiv, "The grid div cannot be null or undefined.");
        VWExistenceChecker.validateExistence(this.gridDiv.getDraggableBodiesDiv(), "The draggable bodies div cannot be null or undefined.");

        let newDraggableBodiesDiv: VWDraggableBodiesDiv = new VWDraggableBodiesDiv(gridSize);
        // TODO: resize the draggable bodies div

        newDraggableBodiesDiv.pack();

        this.gridDiv.getDiv().replaceChild(newDraggableBodiesDiv.getDiv(), this.gridDiv.getDraggableBodiesDiv().getDiv());
        this.gridDiv.setDraggableBodiesDiv(newDraggableBodiesDiv);

        this.gridDiv.getDraggableBodiesDiv().show();
    }

    private hideSimulationControlsDiv(): void {
        if (!VWExistenceChecker.exists(this.simulationControlsDiv)) {
            throw new Error("Cannot hide the simulation controls div: it is null or undefined.");
        }
        else {
            this.simulationControlsDiv.hide();
        }
    }

    private replaceSimulationControlsDiv(newSimulationControlsDiv: VWInternalSimulationControlsDiv): void {
        if (!VWExistenceChecker.exists(newSimulationControlsDiv)) {
            throw new Error("Cannot replace the simulation controls div: the new simulation controls div is null or undefined.");
        }
        else {
            this.div.replaceChild(newSimulationControlsDiv.getDiv(), this.simulationControlsDiv.getDiv());
            this.simulationControlsDiv = newSimulationControlsDiv;
        }
    }

    private setActionEfforts(): void {
        VWIdleAction.overrideDefaultEffort(this.options.getEfforts().get("VWIdleAction"));
        VWMoveAction.overrideDefaultEffort(this.options.getEfforts().get("VWMoveAction"));
        VWTurnAction.overrideDefaultEffort(this.options.getEfforts().get("VWTurnAction"));
        VWCleanAction.overrideDefaultEffort(this.options.getEfforts().get("VWCleanAction"));
        VWDropDirtAction.overrideDefaultEffort(this.options.getEfforts().get("VWDropDirtAction"));
        VWSpeakAction.overrideDefaultEffort(this.options.getEfforts().get("VWSpeakAction"));
        VWBroadcastAction.overrideDefaultEffort(this.options.getEfforts().get("VWBroadcastAction"));
    }

    private saveNewOptions(): void {
        if (!VWExistenceChecker.exists(this.optionsDialogDiv)) {
            throw new Error("Cannot hide the options dialog div: it is null or undefined.");
        }
        else {
            this.saveOptions();
            this.closeAndDestroyOptionsDialog();
            this.printOptions("Options saved:");
        }
    }

    private saveOptions(): void {
        this.parseSimulationSpeed();
        this.parseAutoplayFlag();
        this.parseTooltipsFlag();
        this.parseMaxNumberOfCycles();
        this.parseEfforts();
    }

    private parseSimulationSpeed(): void {
        const speed: number = parseFloat((<HTMLInputElement>document.getElementById("speed_values")).value);

        if (!isNaN(speed)) {
            this.options.setSpeed(speed);
        }
        else {
            this.options.setSpeed(0.0);
        }
    }

    private parseAutoplayFlag(): void {
        const autoplay: boolean = (<HTMLInputElement>document.getElementById("autoplay_checkbox")).checked;

        if (autoplay) {
            this.options.activateAutoplay();
        }
        else {
            this.options.deactivateAutoplay();
        }
    }

    private parseTooltipsFlag(): void {
        const tooltips: boolean = (<HTMLInputElement>document.getElementById("tooltips_checkbox")).checked;

        if (tooltips) {
            this.options.activateTooltips();
            this.initialViewButtonsDiv.showTooltips();
            this.optionsDialogDiv.showTooltips();
        }
        else {
            this.options.deactivateTooltips();
            this.initialViewButtonsDiv.hideTooltips();
            this.optionsDialogDiv.hideTooltips();
        }
    }

    private parseMaxNumberOfCycles(): void {
        const value = (<HTMLInputElement>document.getElementById("max_number_of_cycles_input")).value;

        if (!VWExistenceChecker.exists(value) || value === "") {
            this.options.setMaxNumberOfCycles(undefined); // No limit.
        }
        else {
            this.options.setMaxNumberOfCycles(parseInt(value));
        }
    }

    private parseEfforts(): void {
        let efforts: Map<string, bigint> = new Map();

        for (const action of VWPlatformDiv.getActionNames()) {
            const value = (<HTMLInputElement>document.getElementById(action.toLowerCase() + "_effort_input")).value;

            if (!VWExistenceChecker.exists(value) || value === "") {
                efforts.set(action, undefined); // Will use the default effort.
            }
            else {
                efforts.set(action, BigInt(parseInt(value)));
            }
        }

        this.options.setEfforts(efforts);
    }

    private static getActionNames(): string[] {
        return [
            "VWIdleAction",
            "VWMoveAction",
            "VWTurnAction",
            "VWCleanAction",
            "VWDropDirtAction",
            "VWSpeakAction",
            "VWBroadcastAction"
        ];
    }

    private discardNewOptions(): void {
        if (!VWExistenceChecker.exists(this.optionsDialogDiv)) {
            throw new Error("Cannot hide the options dialog div: it is null or undefined.");
        }
        else {
            this.closeAndDestroyOptionsDialog();
            this.printOptions("Options discarded. The current options are:");
        }
    }

    private closeAndDestroyOptionsDialog(): void {
        this.optionsDialogDiv.hide();
        this.optionsDialogDiv.unpack();
    }

    private printOptions(message: string): void {
        console.log(message);
        console.log("Speed: " + this.options.getSpeed());
        console.log("Autoplay active: " + this.options.isAutoplayActive());
        console.log("Saved state to load: " + this.options.getStateToLoad());
        console.log("Tooltips active: " + this.options.areTooltipsActive());
        console.log("Max number of cycles: " + this.options.getMaxNumberOfCycles());
        console.log("Efforts:");

        VWPlatformDiv.getActionNames().forEach((action: string) => console.log("- " + action + ": " + this.options.getEfforts().get(action)));

        console.log("Teleora file to load: " + this.options.getTeleora());
    }

    private guide(): void {
        window.open("https://github.com/dicelab-rhul/web-agent/") // TODO: Create a Wiki page on GitHub, and adjust the URL accordingly.
    }

    public pack(): void {
        if (this.packed) {
            console.log("The platform div is already packed.");
        }
        else if (!VWExistenceChecker.exists(this.div)) {
            throw new Error("Cannot pack: the platform div is null or undefined.");
        }
        else if (!this.div.hidden) {
            throw new Error("Cannot pack: the platform div is not hidden (it must be before packing it).");
        }
        else if (!VWExistenceChecker.exists(this.initialViewDiv)) {
            throw new Error("Cannot pack: the initial view div is null or undefined.");
        }
        else if (!VWExistenceChecker.exists(this.initialViewButtonsDiv)) {
            throw new Error("Cannot pack: the initial view buttons div is null or undefined.");
        }
        else if (!VWExistenceChecker.exists(this.optionsDialogDiv)) {
            throw new Error("Cannot pack: the options dialog div is null or undefined.");
        }
        else if (!VWExistenceChecker.exists(this.gridDiv)) {
            throw new Error("Cannot pack: the grid div is null or undefined.");
        }
        else if (!VWExistenceChecker.exists(this.simulationControlsDiv)) {
            throw new Error("Cannot pack: the simulation controls div is null or undefined.");
        }
        else {
            this.initialViewDiv.pack();
            this.initialViewButtonsDiv.pack();
            this.optionsDialogDiv.pack();

            // The other divs are packed at a later stage.

            this.div.appendChild(this.initialViewDiv.getDiv());
            this.div.appendChild(this.initialViewButtonsDiv.getDiv());
            this.div.appendChild(this.optionsDialogDiv.getDiv());
            this.div.appendChild(this.gridDiv.getDiv());
            this.div.appendChild(this.simulationControlsDiv.getDiv());

            this.packed = true;
        }
    }

    public unpack(): void {
        if (!this.packed) {
            console.log("The platform div is already unpacked.");
        }
        else if (!VWExistenceChecker.exists(this.div)) {
            throw new Error("Cannot unpack: the platform div is null or undefined.");
        }
        else if (!this.div.hidden) {
            throw new Error("Cannot unpack: the platform div is not hidden (it must be before unpacking it).");
        }
        else if (!VWExistenceChecker.exists(this.initialViewDiv)) {
            throw new Error("Cannot unpack: the initial view div is null or undefined.");
        }
        else if (!VWExistenceChecker.exists(this.initialViewButtonsDiv)) {
            throw new Error("Cannot unpack: the initial view buttons div is null or undefined.");
        }
        else if (!VWExistenceChecker.exists(this.optionsDialogDiv)) {
            throw new Error("Cannot unpack: the options dialog div is null or undefined.");
        }
        else if (!VWExistenceChecker.exists(this.gridDiv)) {
            throw new Error("Cannot unpack: the grid div is null or undefined.");
        }
        else if (!VWExistenceChecker.exists(this.simulationControlsDiv)) {
            throw new Error("Cannot unpack: the simulation controls div is null or undefined.");
        }
        else {
            this.div.removeChild(this.initialViewDiv.getDiv());
            this.div.removeChild(this.initialViewButtonsDiv.getDiv());
            this.div.removeChild(this.optionsDialogDiv.getDiv());
            this.div.removeChild(this.gridDiv.getDiv());
            this.div.removeChild(this.simulationControlsDiv.getDiv());

            this.packed = false;
        }
    }

    public show(): void {
        if (!VWExistenceChecker.exists(this.div)) {
            throw new Error("Cannot show: the platform div is null or undefined.");
        }
        else if (!this.div.hidden) {
            console.log("The platform div is already shown.");
        }
        else if (!this.packed) {
            throw new Error("Cannot show: the platform div is not packed.");
        }
        else {
            this.initialViewDiv.show();
            this.initialViewButtonsDiv.show();
            this.div.hidden = false;
        }
    }

    public hide(): void {
        if (!VWExistenceChecker.exists(this.div)) {
            throw new Error("Cannot hide: the platform div is null or undefined.");
        }
        else if (this.div.hidden) {
            console.log("The platform div is already hidden.");
        }
        else if (!this.packed) {
            throw new Error("Cannot hide: the platform div is not packed.");
        }
        else {
            this.initialViewDiv.hide();
            this.initialViewButtonsDiv.hide();
            this.optionsDialogDiv.hide();
            this.gridDiv.hide();
            this.simulationControlsDiv.hide();

            this.div.hidden = true;
        }
    }

    public getDiv(): HTMLDivElement {
        return VWExistenceChecker.validateExistence(this.div, "Cannot get the platform div: the div is null or undefined.");
    }

    public isPacked(): boolean {
        return this.packed;
    }

    public isHidden(): boolean {
        return this.getDiv().hidden;
    }
}

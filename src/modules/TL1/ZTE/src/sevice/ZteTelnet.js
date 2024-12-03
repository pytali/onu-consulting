import {Telnet} from "onu-consulting/services";
import {Parse} from "onu-consulting/utils";


export default class ZTETelnet extends Telnet {
    constructor(workerData, config) {
        super(workerData, config);
    }

    parse(data) {
        return Parse.ZTEparseResponse(data);
    }


}

import {tb_devices} from "../database/index.js";
import {UnregInfo} from '../headless/UnregInfo.js'

export default async function Unregonu(args) {

    const devices = await tb_devices.find( {});

    let onuObj = []

    UnregInfo.forEach( (onu) => {

        let obj = {}

        // obj['oltip'] = onu.IP
        obj['oltname'] = devices.filter( device => device.IP === onu.IP)[0].DEVNAME
        // obj['oltvendor'] = onu.VENDOR
        // obj['ponid'] = onu.PONID
        obj['sn'] = onu.SN
        obj['onutype'] = onu.DT

        onuObj.push(obj)


    })



    console.log(args)

    return onuObj

}
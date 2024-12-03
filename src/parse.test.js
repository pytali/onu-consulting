function parseResponse(response) {

    const headerPattern = /\r\n\n\s\s\s(.+)\s(\d{4})\-(\d{2})\-(\d{2})\s(\d{2}):(\d{2}):(\d{2})/
    const responseIdPattern = /(\r\nM\s\s(.+)\s(\w+))|(\r\nM\s\s(.+))/
    const responseBlockWithTotalPattern = /(\r\n\s\s\stotalrecord=(\d+)\r\n)/
    const responseBlockWithErrorsPattern = /(\r\n\s\s\sEN=(\S+)\s\s\sENDESC=(.+))/
    const errorBlockPattern = /(\r\n\s\s\s(\S+)\r\n\s\s\s"(.+)")/
    const resultBlockPatternGlobal = /\r\n\r\n\r\n-*(\r\n((\w+\t|\w+)*)((\r\n((.+\t).+)*)*))\r\n-*\r\n\r\n/g
    const resultBlockPattern = /\r\n\r\n\r\n-*(\r\n((\w+\t|\w+)*)((\r\n((.+\t).+)*)*))\r\n-*\r\n\r\n/
    const resultBlockPatternWithTitle = /\r\n\s\s\s(.+)\r\n\s\s\s-+\r\n\s\s\s((\w+\s\s).+)\r\n\s\s\s((.+\r\n)*)\s\s\s-+\r\n;|>/
    const resultBlockPatternOnlyTitle = /\r\n\s\s\s(.+)\r\n\s\s\s-+\r\n\s\s\s((\w+\s\s).+)/

    const matchHeader = response.match(headerPattern)
    const matchResponseId = response.match(responseIdPattern)
    const matchResponseBlockWithTotal = response.match(responseBlockWithTotalPattern)
    const matchResponseBlockWithErros = response.match(responseBlockWithErrorsPattern)
    const matchResultBlockGlobal = response.match(resultBlockPatternGlobal)
    const matchResultBlock = response.match(resultBlockPattern)
    const matchResultBlockWithTitle = response.match(resultBlockPatternWithTitle)
    const matchErrorBlock = response.match(errorBlockPattern)
    const matchResultBlockOnlyTitle = response.match(resultBlockPatternOnlyTitle)

    let parsedResponse = {}

    parsedResponse['sid'] = matchHeader[1].trim()
    parsedResponse['timestamp'] = new Date(`${matchHeader[2]}-${matchHeader[3]}-${matchHeader[4]}T${matchHeader[5]}:${matchHeader[6]}:${matchHeader[7]}`)
    if (matchResponseId[1]) {

        parsedResponse['tag'] = matchResponseId[2].trim()
        parsedResponse['completionCode'] = matchResponseId[3].trim()
    } else {

        parsedResponse['tag'] = matchResponseId[5].trim()
    }

    if (matchErrorBlock) {
        parsedResponse['EN'] = matchErrorBlock[2]
        parsedResponse['ENDESC'] = matchErrorBlock[3]
        return parsedResponse

    }
    if (!matchResponseBlockWithTotal) {
        parsedResponse['EN'] = matchResponseBlockWithErros[2]
        parsedResponse['ENDESC'] = matchResponseBlockWithErros[3]
        return parsedResponse
    } else {
        parsedResponse['EN'] = matchResponseBlockWithErros[2]
        parsedResponse['ENDESC'] = matchResponseBlockWithErros[3]
        parsedResponse['totalBlocks'] = 1
        parsedResponse['blockNumber'] = 1
        parsedResponse['blockRecords'] = matchResponseBlockWithTotal[2]
        if (matchResultBlockWithTitle !== null) {
            parsedResponse['atributes'] = matchResultBlockWithTitle[2].split('  ').filter(Boolean)
            let result = []
            matchResultBlockWithTitle[4].split('\r\n').filter(Boolean).map((line, index) => {

                result.push(line.trim().split('  '))

            })
            parsedResponse['result'] = result

            return parsedResponse
        } else {

            parsedResponse['atributes'] = matchResultBlockOnlyTitle[2].split('  ').filter(Boolean)
            parsedResponse['result'] = []
            return  parsedResponse

        }
    }

}


const text = "\r\n\n   brd-pvo-dpd-netu31-a 2024-08-07 09:30:49\r\nM  CTAG COMPLD\r\n   EN=0   ENDESC=No Error\r\n   \r\n   totalrecord=19\r\n   \r\n   List of Board Info\r\n   -----------------------------------------------------\r\n   BOARDID  BSTAT  BOARDTYPE  BSERVICE  PNUM  SWVER  HWVER  MEM  CPU\r\n   1-1-1  Normal  GFGH  GPON  16  V1.2.2  V1.0.0  49  5\r\n   1-1-2  Normal  GFGH  GPON  16  V1.2.2  V1.0.0  49  8\r\n   1-1-3  Normal  GFGH  GPON  16  V1.2.2  V1.0.0  51  8\r\n   1-1-4  Normal  GFGH  GPON  16  V1.2.2  V1.0.0  53  23\r\n   1-1-5  Normal  GFGH  GPON  16  V1.2.2  V1.0.0  53  23\r\n   1-1-6  Normal  GFGH  GPON  16  V1.2.2  V1.0.0  53  21\r\n   1-1-7  Normal  GFGH  GPON  16  V1.2.2  V1.0.0  50  12\r\n   1-1-8  Normal  GFGH  GPON  16  V1.2.2  V1.0.0  50  5\r\n   1-1-9  Normal  GFGH  GPON  16  V1.2.2  V1.0.0  50  6\r\n   1-1-10  Normal  SFUQ  Control  4  V1.2.2  V1.0.0  30  8\r\n   1-1-12  Normal  GFGH  GPON  16  V1.2.2  V1.0.0  50  7\r\n   1-1-13  Normal  GFGH  GPON  16  V1.2.2  V1.0.0  50  8\r\n   1-1-14  Normal  GFGH  GPON  16  V1.2.2  V1.0.0  51  7\r\n   1-1-15  Normal  GFGH  GPON  16  V1.2.2  V1.0.0  51  5\r\n   1-1-16  Normal  GFGH  GPON  16  V1.2.2  V1.0.0  52  21\r\n   1-1-17  Normal  GFGH  GPON  16  V1.2.2  V1.0.0  49  5\r\n   1-1-18  Normal  PRVR  Power  0  --  V1.0.0  --  --\r\n   1-1-20  Normal  PRVR  Power  0  --  V1.0.0  --  --\r\n   1-1-21  Normal  FCVDIC  Other  0  --  V1.0.0  --  --\r\n   -----------------------------------------------------\r\n;"

const text2 = "\r\n\n   brd-pvo-dpd-netu31-a 2024-08-07 10:28:52\r\nM  Error DENY\r\n   PICC\r\n   \"ILLEGAL COMMAND CODE\"\r\n;"

const text3 = "\r\n" +
    "\n" +
    "   brd-pvo-dpd-netu31-a 2024-08-07 10:15:17\r\n" +
    "M  CTAG COMPLD\r\n" +
    "   EN=0   ENDESC=No Error\r\n" +
    ";\r\n"

const text4 = "\r\n" +
    "\n" +
    "   brd-pvo-dpd-netu31-a 2024-08-07 10:23:23\r\n" +
    "M  CTAG COMPLD\r\n" +
    "   EN=0   ENDESC=No Error\r\n" +
    "   \r\n" +
    "   totalrecord=15\r\n" +
    "   \r\n" +
    "   List of All Device Info\r\n" +
    "   -----------------------------------------------------\r\n" +
    "   DID  DIP  DNAME  DTYPE  STATUS  LOCATION\r\n" +
    "   10.0.51.200  10.0.51.200  BRD-PVO-JAPA-CO:A - 10.0.51.200  C650  Up  root|GloboFiber\r\n" +
    "   10.0.46.200  10.0.46.200  BRD-NVME-NOAO-COA  C620  Up  root|GloboFiber\r\n" +
    "   10.0.50.200  10.0.50.200  BRD-PVO-UGM-CO:A - 10.0.50.200  C600  Up  root|Brasil Digital\r\n" +
    "   10.0.1.201  10.0.1.201  BRD-PVO-DPD-CO:B - 10.0.1.201  C600  Up  root|Brasil Digital\r\n" +
    "   10.0.54.200  10.0.54.200  BRD-PVO-JAME-CO:A - 10.0.54.200  C600  Up  root|GloboFiber\r\n" +
    "   10.0.34.204  10.0.34.204  BRD-PVO-VLV-CO:D - 10.0.34.204  C650  Up  root|Brasil Digital\r\n" +
    "   10.0.56.200  10.0.56.200  BRD-PVO-STAN-CO:A - 10.0.56.200  C650  Up  root|Brasil Digital\r\n" +
    "   10.0.57.200  10.0.57.200  BRD-HUT-NHV-CO:A - 10.0.57.200  C650  Up  root|Brasil Digital\r\n" +
    "   10.0.66.200  10.0.66.200  BRD-PVO-EXT-CO:A - 10.0.66.200  C650  Up  root|Brasil Digital\r\n" +
    "   10.0.64.200  10.0.64.200  BRD-CDEY-SAMU-CO:A - 10.0.64.200  C610  Up  root|GloboFiber\r\n" +
    "   10.0.65.200  10.0.65.200  BRD-PVO-VSBU-CO:A - 10.0.65.200  C650  Up  root|Brasil Digital\r\n" +
    "   10.0.68.200  10.0.68.200  BRD-PVO-VNCF-CO:A - 10.0.68.200  C620  Up  root|Brasil Digital\r\n" +
    "   10.0.32.200  10.0.32.200  BRD-PVO-ECV-CO:A - 10.0.32.200  C600  Up  root|Brasil Digital\r\n" +
    "   10.0.31.200  10.0.31.200  BRD-CDEY-PLH-CO:A - 10.0.31.200  C650  Up  root|Brasil Digital\r\n" +
    "   10.0.59.200  10.0.59.200  BRD-NVME-JCN-CO:A - 10.0.59.200  C620  Up  root|GloboFiber\r\n" +
    "   -----------------------------------------------------\r\n" +
    ";\r\n"

const text5 = "\r\n" +
    "\n" +
    "   brd-pvo-dpd-netu31-a 2024-08-07 22:10:27\r\n" +
    "M  CTAG COMPLD\r\n" +
    "   EN=0   ENDESC=No Error\r\n" +
    "   \r\n" +
    "   totalrecord=0\r\n" +
    "   \r\n" +
    "   List of unreg onu information\r\n" +
    "   -----------------------------------------------------\r\n" +
    "   MAC  LOID  PWD  ERROR  PONID  SN  AUTHTIME  DT  DEVNAME  DEVIP\r\n" +
    "   -----------------------------------------------------\r\n" +
    ";\r\n"




function removeDuplicateIPsExceptDifferentSN(entries) {
    const seenIPs = {};
    const uniqueEntries = [];

    entries.forEach(entry => {
        if (!seenIPs[entry.IP]) {
            seenIPs[entry.IP] = new Set();
        }

        if (!seenIPs[entry.IP].has(entry.SN)) {
            seenIPs[entry.IP].add(entry.SN);
            uniqueEntries.push(entry);
        }
    });

    return uniqueEntries;
}

// Example usage:
const table = [
    { IP: '10.0.31.200', VENDOR: 'ZTE', MAC: '--', LOID: '123456789', PWD: '123456', ERROR: 'Unauth', PONID: '1-1-1-14', SN: 'ZTEGD2B3163C', AUTHTIME: '2024-08-15 17:23:07', DT: 'F670LV9.0' },
    { IP: '10.0.64.200', VENDOR: 'ZTE', MAC: '--', LOID: '123456789', PWD: '123456', ERROR: 'Unauth', PONID: '1-1-3-13', SN: 'ZTEGC44E365C', AUTHTIME: '2024-08-15 17:23:03', DT: 'F670LV1.1.01' },
    { IP: '10.0.31.200', VENDOR: 'ZTE', MAC: '--', LOID: '123456789', PWD: '123456', ERROR: 'Unauth', PONID: '1-1-1-14', SN: 'ZTEGD2B3163D', AUTHTIME: '2024-08-15 17:22:57', DT: 'F670LV9.0' },
    { IP: '10.0.64.200', VENDOR: 'ZTE', MAC: '--', LOID: '123456789', PWD: '123456', ERROR: 'Unauth', PONID: '1-1-3-13', SN: 'ZTEGC44E365C', AUTHTIME: '2024-08-15 17:22:54', DT: 'F670LV1.1.01' },
    { IP: '10.0.32.200', VENDOR: 'ZTE', MAC: '--', LOID: 'user', PWD: '1234567890', ERROR: 'Unauth', PONID: '1-1-7-1', SN: 'MKPGB4624346', AUTHTIME: '2024-08-15 17:22:51', DT: 'GONUAC001' },
    { IP: '10.0.66.200', VENDOR: 'ZTE', MAC: '--', LOID: '123456789', PWD: '123456', ERROR: 'Unauth', PONID: '1-1-1-6', SN: 'ZTEGD4D05822', AUTHTIME: '2024-08-15 17:22:55', DT: 'F6600PV9.0.12' },
    { IP: '10.0.24.201', VENDOR: 'Fiberhome', MAC: '--', LOID: '123456789', PWD: 'GD2B0A863', ERROR: '--', PONID: '1-1-13-16', SN: 'ZTEGd2b0a863', AUTHTIME: '0000-00-00 00:00:00', DT: 'HG6145E' }
];

const uniqueTable = removeDuplicateIPsExceptDifferentSN(table);
console.log(uniqueTable);
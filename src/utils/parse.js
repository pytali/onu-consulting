import { logger } from 'onu-consulting/utils';
export default class Parse {

    static ZTEparseResponse(response) {

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
            parsedResponse['totalBlocks'] = "1"
            parsedResponse['blockNumber'] = "1"
            parsedResponse['blockRecords'] = matchResponseBlockWithTotal[2]
            if (matchResultBlockWithTitle !== null) {
                parsedResponse['attributes'] = matchResultBlockWithTitle[2].split('  ').filter(Boolean)
                let result = []
                matchResultBlockWithTitle[4].split('\r\n').filter(Boolean).map((line, index) => {

                    result.push(line.trim().split('  '))

                })
                parsedResponse['result'] = result

                return parsedResponse
            } else {

                parsedResponse['attributes'] = matchResultBlockOnlyTitle[2].split('  ').filter(Boolean)
                parsedResponse['result'] = []
                return  parsedResponse

            }
        }

    }
    static FHparseResponse(response) {

        const headerPattern = /\r\n\n\s\s\s(.+)\s(\d{4})\-(\d{2})\-(\d{2})\s(\d{2}):(\d{2}):(\d{2})/
        const responseIdPattern = /(\r\nM\s\s(.+)\s(\w+))|(\r\nM\s\s(.+))/
        const responseBlockPattern = /((\r\n\s\s\sEN=(\S+)\s\s\sENDESC=(.+))|(\r\n\s\s\stotal_blocks=(\d+)\r\n\s\s\sblock_number=(\d+)\r\n\s\s\sblock_records=(\d+)))/
        const resultBlockPatternGlobal = /\r\n\r\n\r\n-*(\r\n((\w+\t|\w+)*)((\r\n((.+\t).+)*)*))\r\n-*\r\n\r\n/g
        const resultBlockPattern = /\r\n\r\n\r\n-*(\r\n((\w+\t|\w+)*)((\r\n((.+\t).+)*)*))\r\n-*\r\n\r\n/
        const resultBlockPatternWithTitle = /\r\n\r\n(.+)\r\n-*\r\n((\w+\t|\w+)*)((\r\n(.+\t).+)*)\r\n-*\r\n\r\n/

        const matchHeader = response.match(headerPattern)
        const matchResponseId = response.match(responseIdPattern)
        const matchResponseBlock = response.match(responseBlockPattern)
        const matchResultBlockGlobal = response.match(resultBlockPatternGlobal)
        const matchResultBlock = response.match(resultBlockPattern)
        const matchResultBlockWithTitle = response.match(resultBlockPatternWithTitle)

        let parsedResponse = {}

        parsedResponse['sid'] = matchHeader[1].trim()
        parsedResponse['timestamp'] = new Date(`${matchHeader[2]}-${matchHeader[3]}-${matchHeader[4]}T${matchHeader[5]}:${matchHeader[6]}:${matchHeader[7]}`)
        if (matchResponseId[1]) {

            parsedResponse['tag'] = matchResponseId[2].trim()
            parsedResponse['completionCode'] = matchResponseId[3].trim()
        } else {

            parsedResponse['tag'] = matchResponseId[5].trim()
        }

        if (matchResponseBlock[2]) {
            parsedResponse['EN'] = matchResponseBlock[3]
            parsedResponse['ENDESC'] = matchResponseBlock[4]
        } else {
            parsedResponse['totalBlocks'] = matchResponseBlock[6]
            parsedResponse['blockNumber'] = matchResponseBlock[7]
            parsedResponse['blockRecords'] = matchResponseBlock[8]
            if (matchResultBlock == null) {

                parsedResponse['attributes'] = matchResultBlockWithTitle[2].split('\t').filter(Boolean)
                parsedResponse['result'] = matchResultBlockWithTitle[4].split('\r\n').filter(Boolean).map((line) => {
                    return line.split('\t').filter(Boolean)
                })
            }else {
                parsedResponse['attributes'] = matchResultBlock[2].split('\t').filter(Boolean)
                parsedResponse['result'] = matchResultBlock[4].split('\r\n').filter(Boolean).map((line) => {
                    return line.split('\t').filter(Boolean)
                })
            }
            if (Number(matchResponseBlock[6]) > 1) {
                let result = []
                matchResultBlockGlobal.forEach((block) => {
                    result.push(...block.match(resultBlockPattern)[4].split('\r\n').filter(Boolean).map((line) => {
                        return line.split('\t').filter(Boolean)
                    }))
                })
                parsedResponse['result'] = result
            }
        }


        return parsedResponse;
    }
    static transformDeviceResponse(attributes, response, VENDOR) {
        let transformed = [];

        if(!response) {
            logger.error('No response object');
            return null;
        }

        response.forEach(item => {
            const obj = { VENDOR };
            attributes.forEach((attr, index) => {
                if (['DEVNAME', 'DEVIP', 'DT', 'DEVER'].includes(attr)) {
                    obj[attr] = item[index];
                }
            });
            obj['IP'] = obj['DEVIP'];
            obj['IPOE'] = obj['DEVNAME'].split(" -")[0].replace(/-/g, '.').replace(':', '');
            let { DEVIP, ...rest } = obj;
            transformed.push({ IP: rest['IP'], ...rest})
        });

        // console.log(transformed)
        return transformed;
    }

    static transformUnregResponse(attributes, response, VENDOR, IP) {
        let transformed = [];


        if(response) {

            response.forEach(item => {
                const obj = {VENDOR};
                attributes.forEach((attr, index) => {

                    obj[attr] = item[index];

                });

                if (obj['DT'] == '--') {
                    return;
                }

                if (VENDOR === 'Fiberhome') {
                    obj['PONID'] = `1-1-${obj['SLOTNO']}-${obj['PONNO']}`;
                    obj['SN'] = obj['MAC'];
                    obj['IP'] = obj['OLTID'];

                    let {SLOTNO, PONNO, MAC, OLTID, VENDOR, AUTHTIME, DT, ...restFH} = obj;
                    // console.log(restFH)

                    transformed.push({IP: restFH['IP'], VENDOR, MAC: '--', ...restFH, AUTHTIME, DT})

                } else {
                    obj['IP'] = IP || null
                    let {DEVIP, OLTID, ...restZTE} = obj;
                    transformed.push({IP: restZTE['IP'], ...restZTE})

                }
            });
            return transformed;

        } else {
            logger.error('No response object');
            return null;
        }
    }
}
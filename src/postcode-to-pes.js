'use strict'

export default class PostcodeToPes {


    /**
     * Regular expressions from Mark Owen
     * https://4markowen.wordpress.com/2013/10/02/js-version-pes-dno-regex-patterns-to-determine-which-uk-postcode-belongs-to-which-region/
     * @param shortcode
     * @returns {number}
     */

    lookupPes(shortcode) {

        if(shortcode.indexOf('N8') ==0) {
            // This is a problematic region
            // NOTE: N8 overlaps between the 10 and 12 DNOs and would require information for the full postcode to determine the correct supplier.

            return -2
        }

        var patt10 = /AL[0-9]?[0-9]|CB[0-9]?[0-9]|CM[0-9]?[0-9]|CO[0-9]?[0-9]|EW[0-9]?[0-9]|HA[0-9]|HP[0-8]?[^0-9]|HP1[6-9]|HP2[0-9]|IG10|IP[0-9]?[0-9]|LU[0-9]|MK4[0-2|4-5]|NR[0-9]?[0-9]|NW2|NW4|NW7|RM[0-9]?[0-9]|SG[0-9]?[0-9]|SS[0-9]?[0-9]|WD[1-7]|PE3[0-9]|PE1[3-9]|PE[1-3|4|7]?[^0-9]/
        var patt10rev = /9N(?![0-9A-Z])|[0-5|7|8]1N(?![0-9A-Z])|[1-2]2N(?![0-9A-Z])|[^0-9]2N(?![0-9A-Z])|[^0-9]3N(?![0-9A-Z])|[^0-9]4N(?![0-9A-Z])|[^0-9]6N(?![0-9A-Z])|[^0-9]8N(?![0-9A-Z])|4E(?![0-9A-Z])/
        var patt11 = /S8[0-1]|NG[0-9]?[0-9]|NN[0-9]?[0-9]|OX17|MK[0-9]?[^0-9]|MK1[0-9]|MK43|MK46|LN[0-6|8-9]?[^0-9]|LN1[0-9]|LE[0-9]?[0-9]|DN2[0-2]|DE[0-9]?[0-9]|CV[0-9]?[^0-9]|CV1[0-9]|CV2[0-9]|CV3[1-5]|B77|B78|B79|PE2[0-5]|PE1[0-2]|PE[5-6|8-9]/
        var patt11rev = /[0-9]?4S(?![A-Z])|[0-9]?8S(?![A-Z])/
        var patt12 = /SW[0-9]?[ABD-HJLN-VW-Z0-9]|EC[0-9]?[ABD-HJLM-VW-Z0-9]|WC[0-9]?[ABD-HJLN-VW-Z0-9]|SE[0-9]?[0-9]|BR1|BR3|BR7|CR5|DA2|DA5|DA6|DA7|DA8|DA1[4-8]|IG11|IG[1-9][^0]|KT3|KT4|KT2[^0-4]|NW3|NW5|NW6|NW8|NW1[^1-9]/
        var patt12rev = /41W(?![A-Z])|21W(?![A-Z])|11W(?![A-Z])|01W(?![A-Z])|[HMNPRVXY]1W(?![A-Z])|9W(?![A-Z])|8W(?![A-Z])|6W(?![A-Z])|2W(?![A-Z])|[^0-9]1N(?![A-Z])|8N(?![A-Z])|7N(?![A-Z])|5N(?![A-Z])|91N(?![A-Z])|61N(?![A-Z])|[0-9]?[0-3|5-9]E(?![A-Z])/
        var patt13 = /SY1[0-4|6-9]|SY2[0-4]|PR8|PR9|WA[1-2|4-9]?[^0-9]|WA10|WA11|WA16|LL[0-9]?[0-9]|CH[0-9]|CW[0-9]?[^[0-9]|CW10|CW11/
        var patt13rev = /[^0-9A-Z]?[0-9]L(?![A-Z])|[0-9]1L(?![A-Z])|[0-9]2L(?![A-Z])|[0-9]3L(?![A-Z])|[0-9]4L(?![A-Z])|[0-9]6L(?![A-Z])|[0-9]7L(?![A-Z])/
        var patt14 = /WV[0-9]?[0-9]|WS[0-9]?[0-9]|WR[0-9]?[0-9]|TF[0-9]?[0-9]|SY15|SY[0-9]?[^0-9]|ST[0-9]?[0-9]|OX7|OX15|OX16|HR[0-4|6-9]|GL[0-9]?[0-9]|DY[0-9]?[0-9]|CW12|CV37|CV36|BS17|B80|B90?[0-9]/
        var patt14rev = /[^0-9A-Z]?[0-9]B(?![0-9A-Z])|[0-9]1B(?![0-9A-Z])|[0-9]2B(?![0-9A-Z])|[0-9]3B(?![0-9A-Z])|[0-9]4B(?![0-9A-Z])|[0-9]5B(?![0-9A-Z])|[0-9]6B(?![0-9A-Z])|[0-6]7B(?![0-9A-Z])/
        var patt15 = /NE[0-9]?[0-9]|HG[0-9]|SR[0-9]|DL[0-9]?[0-9]|DH[0-9]|YO1(([1-4])|([7-8])(?!5|6))|YO[2-3]([1-5])|YO[1-3,5-9][^1-9]/
        var patt16 = /BB[0-7|9]?[^0-9]|BB1[0-3]|BD24|BL[0-9]|CA[0-9]?[0-9]|FY[1-8]?[^0-9]|LA[0-9]?[0-9]|OL[0-9]?[^0-9]|OL1[0-3|5-6]|PR[1-7]|SK[0-9]?[0-9]|WA3|WA1[2-5]|WN[1-8]|M60|M90/
        var patt16rev = /04L(?![A-Z])|[0-9]?[^0-9A-Z]M(?![0-9A-Z])|[0-9]?[^0-9A-Z]1M(?![0-9A-Z])|[0-9]?[^0-9A-Z]2M(?![0-9A-Z])|[0-9]?[^0-9A-Z]3M(?![0-9A-Z])|[0-9]?[^0-9A-Z]4M(?![0-9A-Z])/
        var patt17 = /AB[0-9]?[0-9]|DD[0-9]?[0-9]|G83|G84|HS[0-9]|IV[0-9]?[0-9]|KA27|KA28|KW[0-9]?[0-9]|KY13|ZE[0-9]|PH[0-9]?[0-9]|PA[2-8][0-9]|FK1[5-9]|FK2[0-2]/
        var patt18 = /EH[0-9]?[0-9]|FK[0-9]?[^0-9]|FK1[0-4]|DG16|G81|G82|KA[0-9]?[^0-9]|KA1[0-9]|KA2[0-5|9]|KA30|KY[0-9]?[^0-9]|KY1[0-2|4-6]|ML[0-9]?[0-9]|PA[0-9]?[^0-9]|PA1[0-9]|TD[0-9]?[0-9]/
        var patt18rev = /[0-9][0-7]G(?![A-Z])|[^0-9][0-5]G(?![0-9A-Z])/
        var patt19 = /ME[0-9]?[0-9]|SM[1-7]|TN[0-9]?[0-9]|TW9|TW10|TW20|CT[0-9]?[0-9]|CR[0-4|6-9]|BN1([0-6])|BN[2-4][0-9]|BN[0-9][^7-8]|BR[2,4,5,6,8]|GU1[^0-9]|GU2[^[0|4|6-9]|GU[4-6]|DA1[^4-8]|DA3|DA4|DA9|KT1[0-9]|KT1|KT[5-9]|KT2[0-4]|RH1[0-3,5-9]|RH20|RH[2-9]|RH1[^4]/
        var patt20 = /SL[0-9]|SN[0-9]?[0-9]|SO1[4-9]|SO[2-5]?[0-9]|SP[0-9]?[0-9]|TW1[1-8]|TW[3-8]|TW2[^0]|TW1[^0]|UB10|UB[0-9]|RH14|RG[0-9]?[0-9]|PO[0-9]?[0-9]|HP9|HP1[0-5]|OX2[0-9]|OX33|OX44|OX[2-6|8-9]|OX1[0-4|8]|OX1[^0-9]|BH[0-9]?[0-9]|BN17|BN18|DT11|DT10|DT1|DT[2-5|9]|BA[7-9]|BA1[0-5]|BA2[0-2]|GU[7-9]|GU3[0-5]|GU3|GU1[0-9]|GU2[0|4|6-9]/
        var patt20rev = /31W(?![A-Z])|7W(?![A-Z])|5W(?![A-Z])|4W(?![A-Z])|3W(?![A-Z])/
        var patt21 = /SY25|SA[0-9]?[0-9]|NP44|NP16|NP[0-9]?[^0-9]|LD[0-8]|HR5|CF[0-9]?[0-9]/
        var patt22 = /TR1|TR2|TQ[0-9]?[0-9]|TA[0-9]?[0-9]|PL[0-9]?[0-9]|EX[0-9]?[0-9]|BS99|BS34|BS32|BS1[0-6|8-9]|BS2[0-9]|BS[2-9]|BS1[^0-9]|DT[6-8]|BA[1-6]?[^0-9]|BA16/
        var patt23 = /BB8|BD[0-9]?[^0-9]|BD1[0-9]|BD2[0-3]|DN[0-9]?[^0-9]|DN1[0-9]|DN3[0-9]|DN40|HD[0-8]|HU[0-9]?[0-9]|HX[0-7]|LN7|LS[0-9]?[0-9]|OL14|WF[0-9]?[0-9]|YO4|YO15|YO16/
        var patt23rev = /[^0-9]?[0-9]S(?![0-9A-Z])|[0-9]1S(?![0-9A-Z])|[0-9]2S(?![0-9A-Z])|[0-9]3S(?![0-9A-Z])|[0-9]6S(?![0-9A-Z])|[0-9]7S(?![0-9A-Z])/

        const reversedShortcode = shortcode.split('').reverse().join('')
        
        if (patt10.test(shortcode) || patt10rev.test(reversedShortcode)) return 10
        if (patt11.test(shortcode) || patt11rev.test(reversedShortcode)) return 11
        if (patt12.test(shortcode) || patt12rev.test(reversedShortcode)) return 12
        if (patt13.test(shortcode) || patt13rev.test(reversedShortcode)) return 13
        if (patt14.test(shortcode) || patt14rev.test(reversedShortcode)) return 14
        if (patt15.test(shortcode)) return 15
        if (patt16.test(shortcode) || patt16rev.test(reversedShortcode)) return 16
        if (patt17.test(shortcode)) return 17
        if (patt18.test(shortcode) || patt18rev.test(reversedShortcode)) return 18
        if (patt19.test(shortcode) ) return 19
        if (patt20.test(shortcode) || patt20rev.test(reversedShortcode)) return 20
        if (patt21.test(shortcode) ) return 21
        if (patt22.test(shortcode) ) return 22
        if (patt23.test(shortcode) || patt23rev.test(reversedShortcode)) return 23

        // Unknown region
        return -1

    }
}
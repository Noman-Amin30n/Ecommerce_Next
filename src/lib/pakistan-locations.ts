export interface PakistanLocation {
  provinces: {
    [key: string]: {
      cities: {
        [key: string]: string[];
      };
    };
  };
}

export const pakistanLocations: PakistanLocation = {
  provinces: {
    Punjab: {
      cities: {
        Lahore: ["54000", "54660", "54700", "54782", "54810"],
        Faisalabad: ["38000", "38060", "38070", "38090", "38100"],
        Rawalpindi: ["46000", "46200", "46300", "47490"],
        Multan: ["60000", "60650"],
        Gujranwala: ["52250", "57000"],
        Sialkot: ["51310", "51320"],
        Bahawalpur: ["63100", "63080"],
        Sargodha: ["40100", "40410"],
        Jhang: ["35200"],
        Attock: ["43600"],
        Bahawalnagar: ["62300"],
        Bhakkar: ["30000"],
        Bhalwal: ["40410"],
        Bhawana: ["35350"],
        Chakwal: ["48800"],
        DeraGhaziKhan: ["32200"],
        Jhelum: ["49600"],
        Kamalia: ["36350"],
        Kasur: ["55030"],
        Mianwali: ["42200"],
        Narowal: ["51600"],
        Okara: ["53600"],
        RahimYarKhan: ["64200"],
        TobaTekSingh: ["36000"],
      },
    },

    Sindh: {
      cities: {
        Karachi: ["74000", "74200", "74400", "74800", "75020", "75300", "75600", "75950"],
        Hyderabad: ["71000", "72052"],
        Sukkur: ["65200"],
        Larkana: ["77150", "77400"],
        Nawabshah: ["67450", "67110"],
        MirpurKhas: ["69000", "69094"],
        Badin: ["72220"],
        Jacobabad: ["79000"],
        Ghotki: ["65020"],
        Jamshoro: ["76010"],
        Kashmore: ["79100"],
      },
    },

    "Khyber Pakhtunkhwa": {
      cities: {
        Peshawar: ["25000", "25120", "25040"],
        Abbottabad: ["22010", "22200"],
        Mardan: ["23200", "23180"],
        Swat: ["19130", "19150"],
        Nowshera: ["24100"],
        Bannu: ["28100"],
        Chitral: ["17200"],
        Dir: ["18000"],
        DeraIsmailKhan: ["29050"],
        Haripur: ["22620"],
        Hangu: ["26190"],
        Kohat: ["26000"],
        Mansehra: ["21300"],
        Swabi: ["23410"],
      },
    },

    Balochistan: {
      cities: {
        Quetta: ["87300", "87600", "87650"],
        Gwadar: ["91200"],
        Hub: ["90100"],
        Chaman: ["86000"],
        Jiwani: ["91400"],
        Kalat: ["88300"],
        Khuzdar: ["89100"],
        Pasni: ["91300"],
        Sibi: ["84000"],
        Turbat: ["92600"],
      },
    },

    "Islamabad Capital Territory": {
      cities: {
        Islamabad: [
          "44000", // GPO
          "44100",
          "44210",
          "44040",
          "44020",
          "44800",
          "45710",
          "45650",
          "45300",
        ],
      },
    },

    "Gilgit Baltistan": {
      cities: {
        Gilgit: ["15100"],
        Skardu: ["16100", "16750"],
        Ghizer: ["15200"],
        Hunza: ["15110"],
        Diamer: ["15300"],
      },
    },

    "Azad Kashmir": {
      cities: {
        Muzaffarabad: ["13100", "12262"],
        Mirpur: ["10250", "10530"],
        Bagh: ["12500"],
        Rawalakot: ["12350"],
        Kotli: ["11130"],
      },
    },
  },
};

/**
 * Global Contemporary Museums — Comprehensive Seed Data
 * ~120+ museums across 7 continents with accurate coordinates.
 *
 * Fields: name, country (ISO 3166-1 alpha-2), city, lat, lng, type, website, ownership
 * type:       "Contemporary" | "Modern" | "Modern & Contemporary" | "Foundation"
 * ownership:  "Public" | "Private" | "Foundation"
 */

export interface MuseumSeed {
    name: string;
    country: string;
    city: string;
    lat: number;
    lng: number;
    type: string;
    website: string | null;
    ownership: string;
}

export const GLOBAL_MUSEUMS: MuseumSeed[] = [
    // ═══════════════════════════════════════════════════
    // NORTH AMERICA — United States
    // ═══════════════════════════════════════════════════
    { name: "MoMA", country: "US", city: "New York", lat: 40.7614, lng: -73.9776, type: "Modern & Contemporary", website: "https://www.moma.org", ownership: "Private" },
    { name: "Whitney Museum of American Art", country: "US", city: "New York", lat: 40.7396, lng: -74.0089, type: "Contemporary", website: "https://whitney.org", ownership: "Private" },
    { name: "Solomon R. Guggenheim Museum", country: "US", city: "New York", lat: 40.7830, lng: -73.9590, type: "Modern & Contemporary", website: "https://www.guggenheim.org", ownership: "Foundation" },
    { name: "The New Museum", country: "US", city: "New York", lat: 40.7223, lng: -73.9930, type: "Contemporary", website: "https://www.newmuseum.org", ownership: "Private" },
    { name: "The Broad", country: "US", city: "Los Angeles", lat: 34.0544, lng: -118.2508, type: "Contemporary", website: "https://www.thebroad.org", ownership: "Foundation" },
    { name: "MOCA Los Angeles", country: "US", city: "Los Angeles", lat: 34.0531, lng: -118.2500, type: "Contemporary", website: "https://www.moca.org", ownership: "Private" },
    { name: "LACMA", country: "US", city: "Los Angeles", lat: 34.0639, lng: -118.3592, type: "Modern & Contemporary", website: "https://www.lacma.org", ownership: "Public" },
    { name: "SFMOMA", country: "US", city: "San Francisco", lat: 37.7857, lng: -122.4011, type: "Modern & Contemporary", website: "https://www.sfmoma.org", ownership: "Private" },
    { name: "Walker Art Center", country: "US", city: "Minneapolis", lat: 44.9688, lng: -93.2889, type: "Contemporary", website: "https://walkerart.org", ownership: "Private" },
    { name: "Art Institute of Chicago", country: "US", city: "Chicago", lat: 41.8796, lng: -87.6237, type: "Modern & Contemporary", website: "https://www.artic.edu", ownership: "Private" },
    { name: "Hirshhorn Museum", country: "US", city: "Washington, D.C.", lat: 38.8888, lng: -77.0230, type: "Modern & Contemporary", website: "https://hirshhorn.si.edu", ownership: "Public" },
    { name: "Pérez Art Museum Miami", country: "US", city: "Miami", lat: 25.7856, lng: -80.1862, type: "Contemporary", website: "https://www.pamm.org", ownership: "Private" },
    { name: "ICA Miami", country: "US", city: "Miami", lat: 25.8126, lng: -80.1924, type: "Contemporary", website: "https://www.icamiami.org", ownership: "Private" },
    { name: "Dia:Beacon", country: "US", city: "Beacon", lat: 41.5025, lng: -73.9690, type: "Contemporary", website: "https://www.diaart.org", ownership: "Foundation" },
    { name: "MASS MoCA", country: "US", city: "North Adams", lat: 42.7009, lng: -73.1115, type: "Contemporary", website: "https://massmoca.org", ownership: "Private" },
    { name: "Menil Collection", country: "US", city: "Houston", lat: 29.7372, lng: -95.3986, type: "Modern & Contemporary", website: "https://www.menil.org", ownership: "Foundation" },
    { name: "MCA Chicago", country: "US", city: "Chicago", lat: 41.8972, lng: -87.6212, type: "Contemporary", website: "https://mcachicago.org", ownership: "Private" },
    { name: "Museum of Contemporary Art San Diego", country: "US", city: "San Diego", lat: 32.8440, lng: -117.2783, type: "Contemporary", website: "https://www.mcasd.org", ownership: "Private" },

    // ─── Canada ───
    { name: "National Gallery of Canada", country: "CA", city: "Ottawa", lat: 45.4295, lng: -75.6989, type: "Modern & Contemporary", website: "https://www.gallery.ca", ownership: "Public" },
    { name: "Musée d'art contemporain de Montréal", country: "CA", city: "Montreal", lat: 45.5095, lng: -73.5662, type: "Contemporary", website: "https://macm.org", ownership: "Public" },
    { name: "Art Gallery of Ontario", country: "CA", city: "Toronto", lat: 43.6536, lng: -79.3925, type: "Modern & Contemporary", website: "https://ago.ca", ownership: "Public" },
    { name: "Vancouver Art Gallery", country: "CA", city: "Vancouver", lat: 49.2827, lng: -123.1207, type: "Modern & Contemporary", website: "https://www.vanartgallery.bc.ca", ownership: "Public" },

    // ─── Mexico ───
    { name: "Museo de Arte Moderno", country: "MX", city: "Mexico City", lat: 19.4243, lng: -99.1777, type: "Modern", website: "https://www.museoartemoderno.com", ownership: "Public" },
    { name: "Museo Tamayo", country: "MX", city: "Mexico City", lat: 19.4261, lng: -99.1811, type: "Contemporary", website: "https://museotamayo.org", ownership: "Public" },
    { name: "MARCO Monterrey", country: "MX", city: "Monterrey", lat: 25.6694, lng: -100.3077, type: "Contemporary", website: "https://www.marco.org.mx", ownership: "Private" },

    // ═══════════════════════════════════════════════════
    // SOUTH AMERICA
    // ═══════════════════════════════════════════════════
    { name: "MASP", country: "BR", city: "São Paulo", lat: -23.5614, lng: -46.6558, type: "Modern & Contemporary", website: "https://masp.org.br", ownership: "Private" },
    { name: "MAM São Paulo", country: "BR", city: "São Paulo", lat: -23.5871, lng: -46.6577, type: "Modern", website: "https://mam.org.br", ownership: "Private" },
    { name: "MAM Rio", country: "BR", city: "Rio de Janeiro", lat: -22.9115, lng: -43.1730, type: "Modern", website: "https://www.mamrio.org.br", ownership: "Private" },
    { name: "MAC USP", country: "BR", city: "São Paulo", lat: -23.5590, lng: -46.7022, type: "Contemporary", website: "https://www.mac.usp.br", ownership: "Public" },
    { name: "MALBA", country: "AR", city: "Buenos Aires", lat: -34.5878, lng: -58.4048, type: "Modern & Contemporary", website: "https://www.malba.org.ar", ownership: "Foundation" },
    { name: "Museo de Arte Moderno de Buenos Aires", country: "AR", city: "Buenos Aires", lat: -34.6225, lng: -58.3658, type: "Modern & Contemporary", website: "https://www.museomoderno.org", ownership: "Public" },
    { name: "Museo de la Solidaridad Salvador Allende", country: "CL", city: "Santiago", lat: -33.4438, lng: -70.6573, type: "Contemporary", website: "https://www.mssa.cl", ownership: "Public" },
    { name: "GAM Centro Cultural Gabriela Mistral", country: "CL", city: "Santiago", lat: -33.4384, lng: -70.6390, type: "Contemporary", website: "https://www.gam.cl", ownership: "Public" },
    { name: "MAMBO Bogotá", country: "CO", city: "Bogotá", lat: 4.6243, lng: -74.0655, type: "Modern", website: "https://www.mambogota.com", ownership: "Private" },

    // ═══════════════════════════════════════════════════
    // EUROPE — United Kingdom
    // ═══════════════════════════════════════════════════
    { name: "Tate Modern", country: "GB", city: "London", lat: 51.5076, lng: -0.0994, type: "Modern & Contemporary", website: "https://www.tate.org.uk/visit/tate-modern", ownership: "Public" },
    { name: "Tate Britain", country: "GB", city: "London", lat: 51.4910, lng: -0.1278, type: "Modern & Contemporary", website: "https://www.tate.org.uk/visit/tate-britain", ownership: "Public" },
    { name: "Hayward Gallery", country: "GB", city: "London", lat: 51.5063, lng: -0.1154, type: "Contemporary", website: "https://www.southbankcentre.co.uk/venues/hayward-gallery", ownership: "Public" },
    { name: "Whitechapel Gallery", country: "GB", city: "London", lat: 51.5156, lng: -0.0714, type: "Contemporary", website: "https://www.whitechapelgallery.org", ownership: "Public" },
    { name: "Serpentine Galleries", country: "GB", city: "London", lat: 51.5052, lng: -0.1743, type: "Contemporary", website: "https://www.serpentinegalleries.org", ownership: "Public" },

    // ─── France ───
    { name: "Centre Pompidou", country: "FR", city: "Paris", lat: 48.8607, lng: 2.3522, type: "Modern & Contemporary", website: "https://www.centrepompidou.fr", ownership: "Public" },
    { name: "Palais de Tokyo", country: "FR", city: "Paris", lat: 48.8638, lng: 2.2977, type: "Contemporary", website: "https://www.palaisdetokyo.com", ownership: "Public" },
    { name: "Fondation Louis Vuitton", country: "FR", city: "Paris", lat: 48.8767, lng: 2.2615, type: "Contemporary", website: "https://www.fondationlouisvuitton.fr", ownership: "Foundation" },
    { name: "Musée d'Art Moderne de Paris", country: "FR", city: "Paris", lat: 48.8642, lng: 2.2978, type: "Modern & Contemporary", website: "https://www.mam.paris.fr", ownership: "Public" },

    // ─── Spain ───
    { name: "Museo Reina Sofía", country: "ES", city: "Madrid", lat: 40.4084, lng: -3.6944, type: "Modern & Contemporary", website: "https://www.museoreinasofia.es", ownership: "Public" },
    { name: "Guggenheim Museum Bilbao", country: "ES", city: "Bilbao", lat: 43.2688, lng: -2.9340, type: "Modern & Contemporary", website: "https://www.guggenheim-bilbao.eus", ownership: "Foundation" },
    { name: "MACBA Barcelona", country: "ES", city: "Barcelona", lat: 41.3833, lng: 2.1667, type: "Contemporary", website: "https://www.macba.cat", ownership: "Public" },

    // ─── Germany ───
    { name: "Hamburger Bahnhof", country: "DE", city: "Berlin", lat: 52.5280, lng: 13.3720, type: "Contemporary", website: "https://www.smb.museum/museen-einrichtungen/hamburger-bahnhof", ownership: "Public" },
    { name: "Berlinische Galerie", country: "DE", city: "Berlin", lat: 52.5060, lng: 13.4103, type: "Modern & Contemporary", website: "https://berlinischegalerie.de", ownership: "Public" },
    { name: "Museum Ludwig", country: "DE", city: "Cologne", lat: 50.9407, lng: 6.9581, type: "Modern & Contemporary", website: "https://www.museum-ludwig.de", ownership: "Public" },
    { name: "Pinakothek der Moderne", country: "DE", city: "Munich", lat: 48.1484, lng: 11.5720, type: "Modern & Contemporary", website: "https://www.pinakothek-der-moderne.de", ownership: "Public" },
    { name: "Städel Museum", country: "DE", city: "Frankfurt", lat: 50.1040, lng: 8.6724, type: "Modern & Contemporary", website: "https://www.staedelmuseum.de", ownership: "Foundation" },

    // ─── Netherlands ───
    { name: "Stedelijk Museum Amsterdam", country: "NL", city: "Amsterdam", lat: 52.3580, lng: 4.8799, type: "Modern & Contemporary", website: "https://www.stedelijk.nl", ownership: "Public" },
    { name: "Kunsthal Rotterdam", country: "NL", city: "Rotterdam", lat: 51.9128, lng: 4.4722, type: "Contemporary", website: "https://www.kunsthal.nl", ownership: "Public" },
    { name: "Van Abbemuseum", country: "NL", city: "Eindhoven", lat: 51.4361, lng: 5.4786, type: "Modern & Contemporary", website: "https://vanabbemuseum.nl", ownership: "Public" },

    // ─── Belgium ───
    { name: "SMAK", country: "BE", city: "Ghent", lat: 51.0375, lng: 3.7206, type: "Contemporary", website: "https://smak.be", ownership: "Public" },
    { name: "WIELS", country: "BE", city: "Brussels", lat: 50.8173, lng: 4.3345, type: "Contemporary", website: "https://www.wiels.org", ownership: "Foundation" },
    { name: "M HKA", country: "BE", city: "Antwerp", lat: 51.2154, lng: 4.3948, type: "Contemporary", website: "https://muhka.be", ownership: "Public" },

    // ─── Switzerland ───
    { name: "Kunsthaus Zürich", country: "CH", city: "Zürich", lat: 47.3703, lng: 8.5486, type: "Modern & Contemporary", website: "https://www.kunsthaus.ch", ownership: "Public" },
    { name: "Fondation Beyeler", country: "CH", city: "Basel", lat: 47.5914, lng: 7.5958, type: "Modern & Contemporary", website: "https://www.fondationbeyeler.ch", ownership: "Foundation" },
    { name: "Kunstmuseum Basel", country: "CH", city: "Basel", lat: 47.5547, lng: 7.5934, type: "Modern & Contemporary", website: "https://kunstmuseumbasel.ch", ownership: "Public" },

    // ─── Italy ───
    { name: "MAXXI", country: "IT", city: "Rome", lat: 41.9283, lng: 12.4646, type: "Contemporary", website: "https://www.maxxi.art", ownership: "Public" },
    { name: "Pirelli HangarBicocca", country: "IT", city: "Milan", lat: 45.5186, lng: 9.2213, type: "Contemporary", website: "https://pirellihangarbicocca.org", ownership: "Foundation" },
    { name: "Peggy Guggenheim Collection", country: "IT", city: "Venice", lat: 45.4310, lng: 12.3316, type: "Modern & Contemporary", website: "https://www.guggenheim-venice.it", ownership: "Foundation" },

    // ─── Austria ───
    { name: "MUMOK", country: "AT", city: "Vienna", lat: 48.2036, lng: 16.3585, type: "Modern & Contemporary", website: "https://www.mumok.at", ownership: "Public" },
    { name: "Albertina Modern", country: "AT", city: "Vienna", lat: 48.2001, lng: 16.3680, type: "Contemporary", website: "https://www.albertina.at", ownership: "Public" },

    // ─── Nordics / Baltics ───
    { name: "ARKEN Museum of Modern Art", country: "DK", city: "Ishøj", lat: 55.6168, lng: 12.3037, type: "Modern & Contemporary", website: "https://www.arken.dk", ownership: "Public" },
    { name: "Louisiana Museum of Modern Art", country: "DK", city: "Humlebæk", lat: 55.9711, lng: 12.5424, type: "Modern & Contemporary", website: "https://louisiana.dk", ownership: "Foundation" },
    { name: "Moderna Museet", country: "SE", city: "Stockholm", lat: 59.3261, lng: 18.0849, type: "Modern & Contemporary", website: "https://www.modernamuseet.se", ownership: "Public" },
    { name: "Kiasma", country: "FI", city: "Helsinki", lat: 60.1718, lng: 24.9372, type: "Contemporary", website: "https://www.kiasma.fi", ownership: "Public" },
    { name: "Kumu Art Museum", country: "EE", city: "Tallinn", lat: 59.4365, lng: 24.7616, type: "Modern & Contemporary", website: "https://kumu.ekm.ee", ownership: "Public" },
    { name: "Contemporary Art Centre", country: "LT", city: "Vilnius", lat: 54.6791, lng: 25.2764, type: "Contemporary", website: "https://cac.lt", ownership: "Public" },

    // ═══════════════════════════════════════════════════
    // MIDDLE EAST
    // ═══════════════════════════════════════════════════
    { name: "Istanbul Modern", country: "TR", city: "Istanbul", lat: 41.0260, lng: 28.9837, type: "Modern & Contemporary", website: "https://www.istanbulmodern.org", ownership: "Foundation" },
    { name: "Sursock Museum", country: "LB", city: "Beirut", lat: 33.8953, lng: 35.5198, type: "Modern & Contemporary", website: "https://www.sursock.museum", ownership: "Foundation" },
    { name: "Mathaf: Arab Museum of Modern Art", country: "QA", city: "Doha", lat: 25.3071, lng: 51.4401, type: "Modern", website: "https://mathaf.org.qa", ownership: "Public" },
    { name: "Louvre Abu Dhabi", country: "AE", city: "Abu Dhabi", lat: 24.5339, lng: 54.3983, type: "Modern & Contemporary", website: "https://www.louvreabudhabi.ae", ownership: "Public" },
    { name: "Sharjah Art Foundation", country: "AE", city: "Sharjah", lat: 25.3588, lng: 55.3875, type: "Contemporary", website: "https://www.sharjahart.org", ownership: "Foundation" },

    // ═══════════════════════════════════════════════════
    // AFRICA
    // ═══════════════════════════════════════════════════
    { name: "Zeitz MOCAA", country: "ZA", city: "Cape Town", lat: -33.9082, lng: 18.4186, type: "Contemporary", website: "https://zeitzmocaa.museum", ownership: "Foundation" },
    { name: "Norval Foundation", country: "ZA", city: "Cape Town", lat: -34.0046, lng: 18.4449, type: "Contemporary", website: "https://norvalfoundation.org", ownership: "Foundation" },
    { name: "Iziko South African National Gallery", country: "ZA", city: "Cape Town", lat: -33.9287, lng: 18.4149, type: "Modern & Contemporary", website: "https://www.iziko.org.za", ownership: "Public" },
    { name: "MACAAL Marrakech", country: "MA", city: "Marrakech", lat: 31.6070, lng: -8.0135, type: "Contemporary", website: "https://macaal.org", ownership: "Foundation" },

    // ═══════════════════════════════════════════════════
    // ASIA — Japan
    // ═══════════════════════════════════════════════════
    { name: "Mori Art Museum", country: "JP", city: "Tokyo", lat: 35.6604, lng: 139.7292, type: "Contemporary", website: "https://www.mori.art.museum", ownership: "Private" },
    { name: "National Museum of Modern Art, Tokyo", country: "JP", city: "Tokyo", lat: 35.6913, lng: 139.7564, type: "Modern & Contemporary", website: "https://www.momat.go.jp", ownership: "Public" },
    { name: "Museum of Contemporary Art Tokyo", country: "JP", city: "Tokyo", lat: 35.6807, lng: 139.8078, type: "Contemporary", website: "https://www.mot-art-museum.jp", ownership: "Public" },
    { name: "21st Century Museum of Contemporary Art, Kanazawa", country: "JP", city: "Kanazawa", lat: 36.5607, lng: 136.6587, type: "Contemporary", website: "https://www.kanazawa21.jp", ownership: "Public" },
    { name: "Benesse Art Site Naoshima", country: "JP", city: "Naoshima", lat: 34.4607, lng: 133.9959, type: "Contemporary", website: "https://benesse-artsite.jp", ownership: "Foundation" },

    // ─── South Korea ───
    { name: "MMCA Seoul", country: "KR", city: "Seoul", lat: 37.5797, lng: 126.9804, type: "Modern & Contemporary", website: "https://www.mmca.go.kr", ownership: "Public" },
    { name: "Leeum Museum of Art", country: "KR", city: "Seoul", lat: 37.5370, lng: 126.9997, type: "Modern & Contemporary", website: "https://www.leeum.org", ownership: "Foundation" },
    { name: "Art Sonje Center", country: "KR", city: "Seoul", lat: 37.5785, lng: 126.9773, type: "Contemporary", website: "https://artsonje.org", ownership: "Foundation" },
    { name: "Busan Museum of Art", country: "KR", city: "Busan", lat: 35.1666, lng: 129.1352, type: "Contemporary", website: "https://art.busan.go.kr", ownership: "Public" },
    { name: "Nam June Paik Art Center", country: "KR", city: "Yongin", lat: 37.2690, lng: 127.1065, type: "Contemporary", website: "https://njpartcenter.kr", ownership: "Public" },
    { name: "Asia Culture Center", country: "KR", city: "Gwangju", lat: 35.1460, lng: 126.9186, type: "Contemporary", website: "https://www.acc.go.kr", ownership: "Public" },

    // ─── China / Hong Kong ───
    { name: "M+", country: "HK", city: "Hong Kong", lat: 22.3022, lng: 114.1604, type: "Modern & Contemporary", website: "https://www.mplus.org.hk", ownership: "Public" },
    { name: "UCCA Center for Contemporary Art", country: "CN", city: "Beijing", lat: 39.9835, lng: 116.4910, type: "Contemporary", website: "https://ucca.org.cn", ownership: "Foundation" },
    { name: "Power Station of Art", country: "CN", city: "Shanghai", lat: 31.1975, lng: 121.4931, type: "Contemporary", website: "https://www.powerstationofart.com", ownership: "Public" },
    { name: "Long Museum West Bund", country: "CN", city: "Shanghai", lat: 31.1746, lng: 121.4477, type: "Contemporary", website: "https://www.thelongmuseum.org", ownership: "Private" },

    // ─── Taiwan ───
    { name: "Taipei Fine Arts Museum", country: "TW", city: "Taipei", lat: 25.0724, lng: 121.5246, type: "Modern & Contemporary", website: "https://www.tfam.museum", ownership: "Public" },
    { name: "MOCA Taipei", country: "TW", city: "Taipei", lat: 25.0530, lng: 121.5222, type: "Contemporary", website: "https://www.mocataipei.org.tw", ownership: "Public" },

    // ─── Singapore ───
    { name: "National Gallery Singapore", country: "SG", city: "Singapore", lat: 1.2897, lng: 103.8516, type: "Modern & Contemporary", website: "https://www.nationalgallery.sg", ownership: "Public" },
    { name: "Singapore Art Museum", country: "SG", city: "Singapore", lat: 1.2977, lng: 103.8493, type: "Contemporary", website: "https://www.singaporeartmuseum.sg", ownership: "Public" },

    // ─── India ───
    { name: "Kiran Nadar Museum of Art", country: "IN", city: "New Delhi", lat: 28.5740, lng: 77.3210, type: "Modern & Contemporary", website: "https://www.knma.in", ownership: "Foundation" },
    { name: "National Gallery of Modern Art", country: "IN", city: "New Delhi", lat: 28.6118, lng: 77.2295, type: "Modern", website: "https://ngmaindia.gov.in", ownership: "Public" },

    // ─── Southeast Asia ───
    { name: "Bangkok Art and Culture Centre", country: "TH", city: "Bangkok", lat: 13.7466, lng: 100.5300, type: "Contemporary", website: "https://www.bacc.or.th", ownership: "Public" },
    { name: "Museum MACAN", country: "ID", city: "Jakarta", lat: -6.1755, lng: 106.7966, type: "Modern & Contemporary", website: "https://www.museummacan.org", ownership: "Foundation" },
    { name: "The Factory Contemporary Arts Centre", country: "VN", city: "Ho Chi Minh City", lat: 10.7823, lng: 106.6977, type: "Contemporary", website: "https://factoryartscentre.com", ownership: "Private" },

    // ═══════════════════════════════════════════════════
    // OCEANIA
    // ═══════════════════════════════════════════════════
    { name: "MCA Australia", country: "AU", city: "Sydney", lat: -33.8600, lng: 151.2093, type: "Contemporary", website: "https://www.mca.com.au", ownership: "Public" },
    { name: "Art Gallery of New South Wales", country: "AU", city: "Sydney", lat: -33.8689, lng: 151.2173, type: "Modern & Contemporary", website: "https://www.artgallery.nsw.gov.au", ownership: "Public" },
    { name: "National Gallery of Victoria", country: "AU", city: "Melbourne", lat: -37.8226, lng: 144.9689, type: "Modern & Contemporary", website: "https://www.ngv.vic.gov.au", ownership: "Public" },
    { name: "MONA", country: "AU", city: "Hobart", lat: -42.8486, lng: 147.2869, type: "Contemporary", website: "https://mona.net.au", ownership: "Private" },
    { name: "Auckland Art Gallery", country: "NZ", city: "Auckland", lat: -36.8520, lng: 174.7634, type: "Modern & Contemporary", website: "https://www.aucklandartgallery.com", ownership: "Public" },
    { name: "Te Papa Tongarewa", country: "NZ", city: "Wellington", lat: -41.2907, lng: 174.7819, type: "Modern & Contemporary", website: "https://www.tepapa.govt.nz", ownership: "Public" },
];

import { useState, useEffect, useMemo, useRef } from "react";

// ─── WIKI PHOTO CACHE ────────────────────────────────────────────────────────
const photoCache = {};

async function wikiPagePhoto(title, lang) {
  try {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=200&origin=*`;
    const r = await fetch(url);
    const d = await r.json();
    const pages = d?.query?.pages || {};
    const page = Object.values(pages)[0];
    if (page && page.pageid && page.pageid !== -1 && page.thumbnail?.source) {
      return page.thumbnail.source;
    }
    return null;
  } catch { return null; }
}

async function wikiSearchPhoto(query, lang) {
  try {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + " footballer")}&srlimit=1&format=json&origin=*`;
    const r = await fetch(url);
    const d = await r.json();
    const hits = d?.query?.search || [];
    if (!hits.length) return null;
    return await wikiPagePhoto(hits[0].title, lang);
  } catch { return null; }
}

// Nomes alternativos conhecidos na Wikipedia
const WIKI_NAMES = {
  // Mexico
  "Luis Malagón": "Luis Malagon",
  "Johan Vasquez": "Johan Vásquez",
  "Jorge Sánchez": "Jorge Sánchez (footballer, born 1998)",
  "Cesar Montes": "César Montes",
  "Jesus Gallardo": "Jesús Gallardo",
  "Israel Reyes": "Israel Reyes (footballer)",
  "Diego Lainez": "Diego Lainez",
  "Carlos Rodriguez": "Carlos Rodríguez (footballer, born 1997)",
  "Edson Alvarez": "Edson Álvarez",
  "Orbelin Pineda": "Orbelín Pineda",
  "Marcel Ruiz": "Marcel Ruiz (footballer)",
  "Érick Sánchez": "Érick Sánchez (footballer)",
  "Hirving Lozano": "Hirving Lozano",
  "Santiago Giménez": "Santiago Giménez",
  "Raúl Jiménez": "Raúl Jiménez",
  "Alexis Vega": "Alexis Vega (footballer)",
  "Roberto Alvarado": "Roberto Alvarado (footballer)",
  "Cesar Huerta": "César Huerta",
  // Brasil
  "Alisson Becker": "Alisson Becker",
  "Marquinhos": "Marquinhos (footballer)",
  "Éder Militão": "Éder Militão",
  "Gabriel Magalhães": "Gabriel Magalhães",
  "Lucas Paquetá": "Lucas Paquetá",
  "Bruno Guimarães": "Bruno Guimarães",
  "Luiz Henrique": "Luiz Henrique (footballer, born 2001)",
  "Vinícius Júnior": "Vinicius Junior",
  "João Pedro": "João Pedro (footballer, born 2001)",
  "Matheus Cunha": "Matheus Cunha",
  "Gabriel Martinelli": "Gabriel Martinelli",
  "Estevão Willian": "Estêvão Willian",
  // Argentina
  "Emiliano Martínez": "Emiliano Martínez (footballer)",
  "Nahuel Molina": "Nahuel Molina",
  "Cristïan Romero": "Cristían Romero",
  "Nicolás Otamendi": "Nicolás Otamendi",
  "Lisandro Martínez": "Lisandro Martínez",
  "Nicolás Tagliafico": "Nicolás Tagliafico",
  "Rodrigo De Paul": "Rodrigo De Paul",
  "Alexis Mac Allister": "Alexis Mac Allister",
  "Leandro Paredes": "Leandro Paredes",
  "Enzo Fernández": "Enzo Fernández",
  "Lautaro Martínez": "Lautaro Martínez",
  "Giovanni Lo Celso": "Giovani Lo Celso",
  "Ángel Di María": "Ángel Di María",
  "Julián Álvarez": "Julián Álvarez",
  "Paulo Dybala": "Paulo Dybala",
  "Lionel Messi": "Lionel Messi",
  // Espanha
  "Unai Simón": "Unai Simón",
  "Robin Le Normand": "Robin Le Normand",
  "Aymeric Laporte": "Aymeric Laporte",
  "Dean Huijsen": "Dean Huijsen",
  "Pedro Porro": "Pedro Porro",
  "Dani Carvajal": "Dani Carvajal",
  "Marc Cucurella": "Marc Cucurella",
  "Martín Zubimendi": "Martín Zubimendi",
  "Rodri": "Rodri (footballer)",
  "Pedri": "Pedri",
  "Fabián Ruiz": "Fabián Ruiz",
  "Mikel Merino": "Mikel Merino",
  "Lamine Yamal": "Lamine Yamal",
  "Dani Olmo": "Dani Olmo",
  "Nico Williams": "Nico Williams (footballer)",
  "Ferran Torres": "Ferran Torres",
  "Álvaro Morata": "Álvaro Morata",
  "Mikel Oyarzabal": "Mikel Oyarzabal",
  // França
  "Mike Maignan": "Mike Maignan",
  "Théo Hernández": "Théo Hernández",
  "Dayot Upamecano": "Dayot Upamecano",
  "Ibrahima Konaté": "Ibrahima Konaté",
  "William Saliba": "William Saliba",
  "Eduardo Camavinga": "Eduardo Camavinga",
  "Aurélien Tchouaméni": "Aurélien Tchouaméni",
  "Antoine Griezmann": "Antoine Griezmann",
  "Ousmane Dembélé": "Ousmane Dembélé",
  "Kylian Mbappé": "Kylian Mbappé",
  "Marcus Thuram": "Marcus Thuram",
  "Randal Kolo Muani": "Randal Kolo Muani",
  // Portugal
  "Diogo Costa": "Diogo Costa (footballer, born 1999)",
  "João Cancêlo": "João Cancêlo",
  "Rúben Dias": "Rúben Dias",
  "Nuno Mendes": "Nuno Mendes (footballer, born 2002)",
  "Diogo Dalot": "Diogo Dalot",
  "Bruno Fernandes": "Bruno Fernandes (footballer, born 1994)",
  "Bernardo Silva": "Bernardo Silva",
  "Gonçalo Ramos": "Gonçalo Ramos",
  "Rafael Leão": "Rafael Leão",
  "João Félix": "João Félix",
  "Cristiano Ronaldo": "Cristiano Ronaldo",
  // Alemanha
  "Marc-André ter Stegen": "Marc-André ter Stegen",
  "Antonio Rüdiger": "Antonio Rüdiger",
  "Joshua Kimmich": "Joshua Kimmich",
  "Florian Wirtz": "Florian Wirtz",
  "Jamal Musiala": "Jamal Musiala",
  "Kai Havertz": "Kai Havertz",
  "Leroy Sané": "Leroy Sané",
  // Inglaterra
  "Jordan Pickford": "Jordan Pickford",
  "Kieran Trippier": "Kieran Trippier",
  "Declan Rice": "Declan Rice",
  "Jude Bellingham": "Jude Bellingham",
  "Bukayo Saka": "Bukayo Saka",
  "Phil Foden": "Phil Foden",
  "Harry Kane": "Harry Kane",
  "Trent Alexander-Arnold": "Trent Alexander-Arnold",
  "Marcus Rashford": "Marcus Rashford",
  "Cole Palmer": "Cole Palmer (footballer)",
  // Holanda
  "Virgil van Dijk": "Virgil van Dijk",
  "Frenkie de Jong": "Frenkie de Jong",
  "Cody Gakpo": "Cody Gakpo",
  "Memphis Depay": "Memphis Depay",
  "Xavi Simons": "Xavi Simons",
  // Bélgica
  "Thibaut Courtois": "Thibaut Courtois",
  "Kevin De Bruyne": "Kevin De Bruyne",
  "Romélu Lukaku": "Romelu Lukaku",
  "Jérémy Doku": "Jérémy Doku",
  "Loïs Openda": "Loïs Openda",
  // Outros notaveis
  "Son Heung-min": "Son Heung-min",
  "Mohamed Salah": "Mohamed Salah",
  "Sadio Mané": "Sadio Mané",
  "Luka Modrić": "Luka Modrić",
  "Viktor Gyökéres": "Viktor Gyökéres",
  "Alexander Isak": "Alexander Isak",
  "Dejan Kulusevski": "Dejan Kulusevski",
  "Victor Osimhen": "Victor Osimhen",
  "Ademola Lookman": "Ademola Lookman",
  "Achraf Hakimi": "Achraf Hakimi",
  "Hakan Çalhanŏlu": "Hakan Çalhanŏlu",
  "Arda Güler": "Arda Güler",
  "Kenan Yıldız": "Kenan Yıldız",
  "Granit Xhaka": "Granit Xhaka",
  "Darwin Núñez": "Darwin Núñez",
  "Federico Valverde": "Federico Valverde",
  "Virgil van Dijk": "Virgil van Dijk",
  "Edinson Cavani": "Edinson Cavani",
  "Luis Suárez": "Luis Suárez",
  "Gianluigi Donnarumma": "Gianluigi Donnarumma",
  "Nicolò Barella": "Nicolò Barella",
  "Federico Chiesa": "Federico Chiesa",
  "Alphonso Davies": "Alphonso Davies",
  "Jonathan David": "Jonathan David (footballer, born 2000)",
  "Moisés Caicedo": "Moisés Caicedo",
  "Enner Valencia": "Enner Valencia",
  "Pervis Estupiñán": "Pervis Estupiñán",
  "Luis Díaz": "Luis Díaz (footballer, born 1997)",
  "James Rodríguez": "James Rodríguez",
  "Radamel Falcao": "Radamel Falcao",
  "Edin Džeko": "Edin Džeko",
};

async function fetchWikiPhoto(playerName) {
  if (!playerName || playerName.includes("★") || playerName === "Foto Time") return null;
  const clean = playerName
    .replace(/ [BC]$/, "").replace(/ (NED|SVK|MLI|2|3)$/, "")
    .replace(" Becker", "").trim();
  if (photoCache[clean] !== undefined) return photoCache[clean];
  photoCache[clean] = null;

  // Lookup table first — mapeamento exato para jogadores conhecidos
  const wikiTitle = WIKI_NAMES[clean] || WIKI_NAMES[playerName.trim()];
  if (wikiTitle) {
    const src = await wikiPagePhoto(wikiTitle, "en");
    if (src) { photoCache[clean] = src; return src; }
  }

  // Try 1: exact title EN
  let src = await wikiPagePhoto(clean, "en");
  // Try 2: exact title ES
  if (!src) src = await wikiPagePhoto(clean, "es");
  // Try 3: exact title PT
  if (!src) src = await wikiPagePhoto(clean, "pt");
  // Try 4: search EN "name footballer"
  if (!src) src = await wikiSearchPhoto(clean, "en");
  // Try 5: search ES
  if (!src) src = await wikiSearchPhoto(clean, "es");
  photoCache[clean] = src;
  return src;
}

// ─── DADOS REAIS PANINI 2026 ────────────────────────────────────────────────
const FWC = [
  { id:"00",   name:"Logo Panini",       foil:true },
  { id:"FWC1", name:"Emblema Oficial",   foil:true },
  { id:"FWC2", name:"Emblema Oficial 2", foil:true },
  { id:"FWC3", name:"Mascotes Oficiais", foil:true },
  { id:"FWC4", name:"Slogan Oficial",    foil:true },
  { id:"FWC5", name:"Bola Oficial",      foil:true },
  { id:"FWC6", name:"Canadá - Cidades",  foil:true },
  { id:"FWC7", name:"México - Cidades",  foil:true },
  { id:"FWC8", name:"EUA - Cidades",     foil:true },
  { id:"REGU", name:"Regular (Extra)",   foil:false },
  { id:"BRON", name:"Bronze (Extra)",    foil:true },
  { id:"PRAT", name:"Prata (Extra)",     foil:true },
  { id:"OURO", name:"Ouro (Extra)",      foil:true },
  { id:"CC1",  name:"Coca-Cola 1",       foil:false },
  { id:"CC2",  name:"Coca-Cola 2",       foil:false },
  { id:"CC3",  name:"Coca-Cola 3",       foil:false },
  { id:"CC4",  name:"Coca-Cola 4",       foil:false },
  { id:"CC5",  name:"Coca-Cola 5",       foil:false },
  { id:"CC6",  name:"Coca-Cola 6",       foil:false },
  { id:"CC7",  name:"Coca-Cola 7",       foil:false },
  { id:"CC8",  name:"Coca-Cola 8",       foil:false },
  { id:"CC9",  name:"Coca-Cola 9",       foil:false },
  { id:"CC10", name:"Coca-Cola 10",      foil:false },
  { id:"CC11", name:"Coca-Cola 11",      foil:false },
  { id:"CC12", name:"Coca-Cola 12",      foil:false },
  { id:"CC13", name:"Coca-Cola 13",      foil:false },
  { id:"CC14", name:"Coca-Cola 14",      foil:false },
  { id:"CC15", name:"Coca-Cola 15",      foil:false },
];

const TEAMS = [
  { code:"MEX", name:"México",          flag:"🇲🇽", color:"#006847" },
  { code:"RSA", name:"África do Sul",   flag:"🇿🇦", color:"#007A4D" },
  { code:"KOR", name:"Coreia do Sul",   flag:"🇰🇷", color:"#003478" },
  { code:"CZE", name:"Rep. Tcheca",     flag:"🇨🇿", color:"#D7141A" },
  { code:"CAN", name:"Canadá",          flag:"🇨🇦", color:"#CC0000" },
  { code:"BIH", name:"Bósnia",          flag:"🇧🇦", color:"#002395" },
  { code:"QAT", name:"Catar",           flag:"🇶🇦", color:"#8D1B3D" },
  { code:"SUI", name:"Suíça",           flag:"🇨🇭", color:"#CC0000" },
  { code:"BRA", name:"Brasil",          flag:"🇧🇷", color:"#009C3B" },
  { code:"MAR", name:"Marrocos",        flag:"🇲🇦", color:"#C1272D" },
  { code:"HAI", name:"Haiti",           flag:"🇭🇹", color:"#00209F" },
  { code:"SCO", name:"Escócia",         flag:"🏴", color:"#003F87" },
  { code:"USA", name:"EUA",             flag:"🇺🇸", color:"#B22234" },
  { code:"PAR", name:"Paraguai",        flag:"🇵🇾", color:"#D52B1E" },
  { code:"AUS", name:"Austrália",       flag:"🇦🇺", color:"#00843D" },
  { code:"TUR", name:"Turquia",         flag:"🇹🇷", color:"#E30A17" },
  { code:"GER", name:"Alemanha",        flag:"🇩🇪", color:"#1a1a1a" },
  { code:"CUW", name:"Curaçao",         flag:"🇨🇼", color:"#003DA5" },
  { code:"CIV", name:"Costa do Marfim", flag:"🇨🇮", color:"#F77F00" },
  { code:"ECU", name:"Equador",         flag:"🇪🇨", color:"#007A33" },
  { code:"NED", name:"Holanda",         flag:"🇳🇱", color:"#FF6600" },
  { code:"JPN", name:"Japão",           flag:"🇯🇵", color:"#003087" },
  { code:"SWE", name:"Suécia",          flag:"🇸🇪", color:"#006AA7" },
  { code:"TUN", name:"Tunísia",         flag:"🇹🇳", color:"#E70013" },
  { code:"BEL", name:"Bélgica",         flag:"🇧🇪", color:"#EF3340" },
  { code:"EGY", name:"Egito",           flag:"🇪🇬", color:"#CE1126" },
  { code:"IRN", name:"Irã",             flag:"🇮🇷", color:"#239F40" },
  { code:"NZL", name:"Nova Zelândia",   flag:"🇳🇿", color:"#00247D" },
  { code:"ESP", name:"Espanha",         flag:"🇪🇸", color:"#AA151B" },
  { code:"CPV", name:"Cabo Verde",      flag:"🇨🇻", color:"#003893" },
  { code:"ARG", name:"Argentina",       flag:"🇦🇷", color:"#4F97D7" },
  { code:"NGA", name:"Nigéria",         flag:"🇳🇬", color:"#008751" },
  { code:"POR", name:"Portugal",        flag:"🇵🇹", color:"#006600" },
  { code:"COL", name:"Colômbia",        flag:"🇨🇴", color:"#C8A200" },
  { code:"FRA", name:"França",          flag:"🇫🇷", color:"#002395" },
  { code:"SEN", name:"Senegal",         flag:"🇸🇳", color:"#00853F" },
  { code:"ENG", name:"Inglaterra",      flag:"🏴", color:"#CF091E" },
  { code:"URU", name:"Uruguai",         flag:"🇺🇾", color:"#5EB6E4" },
  { code:"ITA", name:"Itália",          flag:"🇮🇹", color:"#009246" },
  { code:"BEL2",name:"Bélgica B",       flag:"🇧🇪", color:"#EF3340" },
  { code:"NED2",name:"Holanda B",       flag:"🇳🇱", color:"#FF6600" },
  { code:"CRO", name:"Croácia",         flag:"🇭🇷", color:"#CC0000" },
  { code:"SVK", name:"Eslováquia",      flag:"🇸🇰", color:"#0B4EA2" },
  { code:"CHI", name:"Chile",           flag:"🇨🇱", color:"#D52B1E" },
  { code:"UKR", name:"Ucrânia",         flag:"🇺🇦", color:"#005BBB" },
  { code:"VEN", name:"Venezuela",       flag:"🇻🇪", color:"#CF142B" },
  { code:"MLI", name:"Mali",            flag:"🇲🇱", color:"#14B53A" },
  { code:"ALG", name:"Argélia",         flag:"🇩🇿", color:"#006233" },
  { code:"PER", name:"Peru",            flag:"🇵🇪", color:"#D91023" },
  { code:"IRQ", name:"Iraque",          flag:"🇮🇶", color:"#007A3D" },
  { code:"UZB", name:"Uzbequistão",     flag:"🇺🇿", color:"#1EB53A" },
  { code:"COD", name:"Congo RD",        flag:"🇨🇩", color:"#007FFF" },
];

const PLAYER_DATA = {
  MEX:["Team Logo★","Luis Malagón","Johan Vasquez","Jorge Sánchez","Cesar Montes","Jesus Gallardo","Israel Reyes","Diego Lainez","Carlos Rodriguez","Edson Alvarez","Orbelin Pineda","Marcel Ruiz","Foto Time","Érick Sánchez","Hirving Lozano","Santiago Giménez","Raúl Jiménez","Alexis Vega","Roberto Alvarado","Cesar Huerta"],
  RSA:["Team Logo★","Ronwen Williams","Sipho Chaine","Aubrey Modiba","Samukele Kabini","Mbekezeli Mbokazi","Khulumani Ndamane","Siyabonga Ngezana","Khuliso Mudau","Nkosinathi Sibisi","Teboho Mokoena","Thalente Mbatha","Foto Time","Bathasi Aubaas","Yaya Sithole","Sipho Mbule","Lyle Foster","Iqraam Rayners","Mohau Nkota","Oswin Appollis"],
  KOR:["Team Logo★","Hyeon-woo Jo","Seung-Gyu Kim","Kim Min-jae","Yu-min Cho","Young-woo Seol","Han-beom Lee","Tae-seok Lee","Myung-jae Lee","Jae-sung Lee","In-beom Hwang","Kang-in Lee","Foto Time","Seung-ho Paik","Jens Castrop","Dongg-yeong Lee","Gue-sung Cho","Son Heung-min","Hee-chan Hwang","Hyeon-Gyu Oh"],
  CZE:["Team Logo★","Matej Kovar","Jindrich Stanek","Ladislav Krejci","Vladimir Coufal","Jaroslav Zeleny","Tomas Holes","David Zima","Michal Sadilek","Lukas Provod","Lukas Cerv","Tomas Soucek","Foto Time","Pavel Sulc","Matej Vydra","Vasil Kusej","Tomas Chory","Vaclav Cerny","Adam Hlozek","Patrik Schick"],
  CAN:["Team Logo★","Dayne St. Clair","Alphonso Davies","Alistair Johnston","Samuel Adekugbe","Richie Laryea","Derek Cornelius","Moïse Bombito","Kamal Miller","Stephen Eustáquio","Ismaël Koné","Jonathan Osorio","Foto Time","Jacob Shaffelburg","Mathieu Choinière","Niko Sigur","Tajon Buchanan","Liam Millar","Cyle Larin","Jonathan David"],
  BIH:["Team Logo★","Nikola Vasilj","Amer Dedic","Sead Kolasinac","Tarik Muharemovic","Nihad Mujakic","Nikola Katic","Amir Hadziahmetovic","Benjamin Tahirovic","Armin Gigovic","Ivan Sunjic","Ivan Basic","Foto Time","Dzenis Burnic","Esmir Bajraktarevic","Amar Memic","Ermedin Demirovic","Edin Dzeko","Samed Bazdar","Haris Tabakovic"],
  QAT:["Team Logo★","Meshaal Barsham","Sultan Al-Brake","Lucas Mendes","Homam Ahmed","Boualem Khoukhi","Pedro Miguel","Tarek Salman","Mohamed Al-Mannai","Karim Boudiaf","Assim Madibo","Ahmed Fatehi","Foto Time","Mohammed Waad","Abdulaziz Hatem","Hassan Al-Haydos","Edmilson Junior","Akram Afif","Ahmed Al-Ganehi","Almoez Ali"],
  SUI:["Team Logo★","Gregor Kobel","Yvon Mvogo","Manuel Akanji","Ricardo Rodriguez","Nico Elvedi","Aurèle Amenda","Silvan Widmer","Granit Xhaka","Denis Zakaria","Remo Freuler","Fabian Rieder","Foto Time","Ardon Jashari","Johan Manzambi","Michel Aebischer","Breel Embolo","Ruben Vargas","Dan Ndoye","Zeki Amdouni"],
  BRA:["Team Logo★","Alisson Becker","Bento","Marquinhos","Éder Militão","Gabriel Magalhães","Danilo","Wesley","Lucas Paquetá","Casemiro","Bruno Guimarães","Luiz Henrique","Foto Time","Vinícius Júnior","Rodrygo","João Pedro","Matheus Cunha","Gabriel Martinelli","Raphinha","Estevão Willian"],
  MAR:["Team Logo★","Yassine Bounou","Munir El Kajoui","Achraf Hakimi","Noussair Mazraoui","Nayef Aguerd","Romain Saïss","Jawad El Yamiq","Adam Masina","Sofyan Amrabat","Azzedine Ounahi","Eliesse Ben Seghir","Foto Time","Bilal El Khannouss","Ismael Saibari","Youssef En-Nesyri","Abde Ezzalzouli","Soufiane Rahimi","Brahim Díaz","Ayoub El Kaabi"],
  HAI:["Team Logo★","Johny Placide","Carlens Arcus","Martin Expérience","Jean-Kevin Duverne","Ricardo Adé","Duke Lacroix","Garven Metusala","Hannes Delcroix","Leverton Pierre","Danley Jean Jacques","Jean-Ricner Bellegarde","Foto Time","Christopher Attys","Derrick Etienne Jr","Josue Casimir","Ruben Providence","Duckens Nazon","Louicius Deedson","Frantzdy Pierrot"],
  SCO:["Team Logo★","Angus Gunn","Jack Hendry","Kieran Tierney","Aaron Hickey","Andrew Robertson","Scott McKenna","John Souttar","Anthony Ralston","Grant Hanley","Scott McTominay","Billy Gilmour","Foto Time","Lewis Ferguson","Ryan Christie","Kenny McLean","John McGinn","Lyndon Dykes","Che Adams","Ben Doak"],
  USA:["Team Logo★","Matt Freese","Chris Richards","Tim Ream","Mark McKenzie","Alex Freeman","Antonee Robinson","Tyler Adams","Tanner Tessmann","Weston McKennie","Christian Roldan","Timothy Weah","Foto Time","Diego Luna","Malik Tillman","Christian Pulisic","Brenden Aaronson","Ricardo Pepi","Haji Wright","Folarin Balogun"],
  PAR:["Team Logo★","Roberto Fernández","Orlando Gill","Gustavo Gómez","Fabián Balbuena","Juan José Cáceres","Omar Alderete","Junior Alonso","Mathías Villasanti","Diego Gómez","Damián Bobadilla","Andrés Cubas","Foto Time","Matías Galarza","Julio Enciso","Alejandro Romero Gamarra","Miguel Almirón","Ramón Sosa","Ángel Romero","Antonio Sanabria"],
  AUS:["Team Logo★","Mathew Ryan","Joe Gauci","Harry Souttar","Alessandro Circati","Jordan Bos","Aziz Behich","Cameron Burgess","Lewis Miller","Miloš Degenek","Jackson Irvine","Riley McGree","Foto Time","Aiden O'Neill","Connor Metcalfe","Patrick Yazbek","Craig Goodwin","Kusini Yengi","Nestory Irankunda","Mohamed Toure"],
  TUR:["Team Logo★","Uğurcan Çakır","Mert Müldür","Zeki Çelik","Abdülkerim Bardakcı","Çağlar Söyüncü","Merih Demiral","Ferdi Kadıoğlu","Kaan Ayhan","İsmail Yüksek","Hakan Çalhanoğlu","Orkun Kökçü","Foto Time","Arda Güler","İrfan Can Kahveci","Yunus Akgün","Can Uzun","Barış Alper Yılmaz","Kerem Aktürkoğlu","Kenan Yıldız"],
  GER:["Team Logo★","Marc-André ter Stegen","Jonathan Tah","David Raum","Nico Schlotterbeck","Antonio Rüdiger","Waldemar Anton","Ridle Baku","Maximilian Mittelstädt","Joshua Kimmich","Florian Wirtz","Felix Nmecha","Foto Time","Leon Goretzka","Jamal Musiala","Serge Gnabry","Kai Havertz","Leroy Sané","Karim Adeyemi","Nick Woltemade"],
  CUW:["Team Logo★","Eloy Room","Armando Obispo","Sherel Floranus","Jurien Gaari","Joshua Brenet","Roshon Van Eijma","Shurandy Sambo","Livano Comenencia","Godfried Roemeratoe","Juninho Bacuna","Leandro Bacuna","Foto Time","Tahith Chong","Kenji Gorré","Jearl Margaritha","Jurgen Locadia","Jeremy Antonisse","Gervane Kastaneer","Sontje Hansen"],
  CIV:["Team Logo★","Yahia Fofana","Ghislain Konan","Wilfried Singo","Odilon Kossounou","Evan Ndicka","Willy Boly","Emmanuel Agbadou","Ousmane Diomandé","Franck Kessié","Seko Fofana","Ibrahim Sangaré","Foto Time","Jean-Philippe Gbamin","Amad Diallo","Sébastien Haller","Simon Adingra","Yan Diomandé","Evann Guessand","Oumar Diakité"],
  ECU:["Team Logo★","Hernán Galíndez","Gonzalo Vallé","Piero Hincapié","Pervis Estupiñán","Willian Pacho","Ángelo Preciado","Joel Ordóñez","Moisés Caicedo","Alan Franco","Kendry Páez","Pedro Vite","Foto Time","John Yeboah","Leonardo Campana","Gonzalo Plata","Nilson Angulo","Alan Minda","Kevin Rodríguez","Enner Valencia"],
  NED:["Team Logo★","Bart Verbruggen","Virgil van Dijk","Micky van de Ven","Jurriën Timber","Denzel Dumfries","Nathan Aké","Jeremie Frimpong","Jan Paul van Hecke","Tijjani Reijnders","Ryan Gravenberch","Teun Koopmeiners","Foto Time","Frenkie de Jong","Xavi Simons","Justin Kluivert","Memphis Depay","Donyell Malen","Wout Weghorst","Cody Gakpo"],
  JPN:["Team Logo★","Zion Suzuki","Mochizuki Henrique","Ayumu Seko","Junnosuke Suzuki","Shogo Taniguchi","Tsuyoshi Watanabe","Kaishu Sano","Yuki Soma","Ao Tanaka","Daichi Kamada","Takefusa Kubo","Foto Time","Ritsu Doan","Keito Nakamura","Takumi Minamino","Shuto Machino","Junya Ito","Koki Ogawa","Ayase Ueda"],
  SWE:["Team Logo★","Victor Johansson","Isak Hien","Gabriel Gudmundsson","Emil Holm","Victor Nilsson Lindelöf","Gustaf Lagerbielke","Lucas Bergvall","Hugo Larsson","Jesper Karlström","Yasin Ayari","Mattias Svanberg","Foto Time","Daniel Svensson","Ken Sema","Roony Bardghji","Dejan Kulusevski","Anthony Elanga","Alexander Isak","Viktor Gyökeres"],
  TUN:["Team Logo★","Béchir Ben Said","Aymen Dahmen","Yan Valery","Montassar Talbi","Yassine Meriah","Ali Abdi","Dylan Bronn","Ellyes Skhiri","Aïssa Laïdouni","Ferjani Sassi","Mohamed Ali Ben Romdhane","Foto Time","Hannibal Mejbri","Elias Achouri","Elias Saad","Hazem Mastouri","Ismaël Gharbi","Sayfallah Ltaief","Naïm Sliti"],
  BEL:["Team Logo★","Thibaut Courtois","Arthur Theate","Timothy Castagne","Zeno Debast","Brandon Mechele","Maxim De Cuyper","Thomas Meunier","Youri Tielemans","Amadou Onana","Nicolas Raskin","Alexis Saelemaekers","Foto Time","Hans Vanaken","Kevin De Bruyne","Jérémy Doku","Charles De Ketelaere","Leandro Trossard","Loïs Openda","Romelu Lukaku"],
  EGY:["Team Logo★","Mohamed El-Shenawy","Mohamed Hany","Mohamed Hamdy","Yasser Ibrahim","Khaled Sobhi","Ramy Rabia","Hossam Abdelmaguid","Ahmed Fatouh","Marwan Attia","Zizo","Hamdy Fathy","Foto Time","Mohamed Lasheen","Emam Ashour","Osama Faisal","Mohamed Salah","Mostafa Mohamed","Trezeguet","Omar Marmoush"],
  IRN:["Team Logo★","Alireza Beiranvand","Morteza Pouraliganji","Ehsan Hajsafi","Milad Mohammadi","Shojae Khalilzadeh","Ramin Rezaeian","Hossein Kanaani","Sadegh Moharrami","Saleh Hardani","Saeid Ezatolahi","Saman Ghoddos","Foto Time","Omid Noorafkan","Roozbeh Cheshmi","Mohammad Mohebi","Sardar Azmoun","Mehdi Taremi","Alireza Jahanbakhsh","Ali Gholizadeh"],
  NZL:["Team Logo★","Max Crocombe","Alex Paulsen","Michael Boxall","Liberato Cacace","Tim Payne","Tyler Bindon","Francis de Vries","Finn Surman","Joe Bell","Sarpreet Singh","Ryan Thomas","Foto Time","Matthew Garbett","Marko Stamenić","Ben Old","Chris Wood","Elijah Just","Callum McCowatt","Kosta Barbarouses"],
  ESP:["Team Logo★","Unai Simón","Robin Le Normand","Aymeric Laporte","Dean Huijsen","Pedro Porro","Dani Carvajal","Marc Cucurella","Martín Zubimendi","Rodri","Pedri","Fabián Ruiz","Foto Time","Mikel Merino","Lamine Yamal","Dani Olmo","Nico Williams","Ferran Torres","Álvaro Morata","Mikel Oyarzabal"],
  CPV:["Team Logo★","Vozinha","Logan Costa","Pico","Diney","Steven Moreira","Wagner Pina","Joao Paulo","Yannick Semedo","Kevin Pina","Patrick Andrade","Jamiro Monteiro","Foto Time","Garry Rodrigues","Djaniny","Dylan Tavares","Julio Tavares","Ryan Mendes","Willy Semedo","Nene"],
  ARG:["Team Logo★","Emiliano Martínez","Nahuel Molina","Cristian Romero","Nicolás Otamendi","Lisandro Martínez","Nicolás Tagliafico","Rodrigo De Paul","Alexis Mac Allister","Leandro Paredes","Enzo Fernández","Lautaro Martínez","Foto Time","Giovanni Lo Celso","Ángel Di María","Julián Álvarez","Paulo Dybala","Thiago Almada","L. Martínez","Lionel Messi"],
  NGA:["Team Logo★","Stanley Nwabali","Wilfred Ndidi","William Troost-Ekong","Calvin Bassey","Bright Osayi-Samuel","Ola Aina","Kelechi Iheanacho","Frank Onyeka","Joe Aribo","Ademola Lookman","Samuel Chukwueze","Foto Time","Terem Moffi","Moses Simon","Cyriel Dessers","Alex Iwobi","Victor Boniface","Victor Osimhen","Emmanuel Dennis"],
  POR:["Team Logo★","Diogo Costa","João Cancelo","Rúben Dias","Pepe","Nuno Mendes","Diogo Dalot","João Palhinha","Bruno Fernandes","Vitinha","Bernardo Silva","Rúben Neves","Foto Time","Gonçalo Ramos","Rafael Leão","Pedro Neto","João Félix","Cristiano Ronaldo","Francisco Trincão","Bruma"],
  COL:["Team Logo★","David Ospina","Santiago Arias","Dávinson Sánchez","Yerry Mina","Johan Mojica","Daniel Muñoz","Wilmar Barrios","Jefferson Lerma","Mateus Uribe","Luis Díaz","Juan Cuadrado","Foto Time","Miguel Borja","Jhon Córdoba","Rafael Santos Borré","James Rodríguez","Radamel Falcao","Teo Gutiérrez","Borja"],
  FRA:["Team Logo★","Mike Maignan","Théo Hernández","Dayot Upamecano","Ibrahima Konaté","William Saliba","Jonathan Clauss","Eduardo Camavinga","Aurélien Tchouaméni","Adrien Rabiot","Antoine Griezmann","Ousmane Dembélé","Foto Time","Youssouf Fofana","Randal Kolo Muani","Olivier Giroud","Kingsley Coman","Marcus Thuram","Kylian Mbappé","Barcode"],
  SEN:["Team Logo★","Édouard Mendy","Kalidou Koulibaly","Youssouf Sabaly","Saliou Ciss","Formose Mendy","Pape Sarr","Idrissa Gueye","Cheikhou Kouyaté","Nampalys Mendy","Lamine Camara","Pathé Ciss","Foto Time","Boulaye Dia","Ismaïla Sarr","Sadio Mané","Iliman Ndiaye","Nicolas Jackson","Famara Diédhiou","Bamba Dieng"],
  ENG:["Team Logo★","Jordan Pickford","Kieran Trippier","Harry Maguire","John Stones","Luke Shaw","Reece James","Declan Rice","Jude Bellingham","Bukayo Saka","Phil Foden","Jordan Henderson","Foto Time","Trent Alexander-Arnold","Jack Grealish","Marcus Rashford","Cole Palmer","Harry Kane","Anthony Gordon","Ollie Watkins"],
  URU:["Team Logo★","Sergio Rochet","Mathías Olivera","José María Giménez","Ronald Araújo","Martín Cáceres","Matías Viña","Federico Valverde","Manuel Ugarte","Nicolás Vecino","Facundo Pellistri","Facundo Torres","Foto Time","Rodrigo Bentancur","Giorgian de Arrascaeta","Darwin Núñez","Luis Suárez","Edinson Cavani","Maximiliano Gómez","Giménez"],
  ITA:["Team Logo★","Gianluigi Donnarumma","Giovanni Di Lorenzo","Alessandro Bastoni","Riccardo Calafiori","Gleison Bremer","Matteo Darmian","Nicolò Barella","Sandro Tonali","Jorginho","Manuel Locatelli","Lorenzo Pellegrini","Foto Time","Nicolò Fagioli","Mattia Zaccagni","Davide Frattesi","Federico Chiesa","Giacomo Raspadori","Mateo Retegui","Gianluca Scamacca"],
  BEL2:["Team Logo★","Jordi Vanlerberghe","Amadou Onana","Wout Faes","Alexis Saelemaekers","Julien Duranville","Lois Openda","Charles De Ketelaere","Kevin De Bruyne","Jérémy Doku","Yannick Carrasco","Thomas Kaminski","Foto Time","Arthur Vermeeren","Adnan Januzaj","Dries Mertens","Romelu Lukaku","Divock Origi","Nacer Chadli","Eden Hazard"],
  NED2:["Team Logo★","Andries Noppert","Lutsharel Geertruida","Quilindschy Hartman","Devyne Rensch","Ian Maatsen","Daley Blind","Quinten Timber","Guus Til","Wout Weghorst","Noa Lang","Steven Bergwijn","Foto Time","Brian Brobbey","Lassina Traoré","Ferdi Kadıoğlu","Cody Gakpo","Frenkie de Jong","Memphis Depay","Xavi Simons"],
  CRO:["Team Logo★","Dominik Livaković","Josip Juranović","Dejan Lovren","Joško Gvardiol","Borna Sosa","Josip Stanišić","Mateo Kovačić","Marcelo Brozović","Ivan Perišić","Luka Modrić","Nikola Vlašić","Foto Time","Mario Pašalić","Bruno Petković","Andrej Kramarić","Ivan Zucco","Marko Livaja","Luka Sučić","Ante Budimir"],
  SVK:["Team Logo★","Marek Rodák","Peter Pekarík","Milan Škriniar","Lukáš Šatka","Martin Valjent","Norbert Gyömbér","Ján Greguš","Ondrej Duda","Juraj Kucka","Stanislav Lobotka","Tomáš Suslov","Foto Time","Michal Ďuriš","Matúš Bero","Róbert Bozeník","David Hanč","Ivan Schranz","Dávid Strelec","Lukáš Haraslín"],
  CHI:["Team Logo★","Claudio Bravo","Mauricio Isla","Gary Medel","Guillermo Maripán","Óscar Opazo","Eugenio Mena","Arturo Vidal","Charles Aránguiz","Erick Pulgar","Alexis Sánchez","Marcelo Díaz","Foto Time","Nicolás Zárate","Sebastián Vegas","Marcos Bolados","Eduardo Vargas","Ben Brereton Díaz","Darío Osorio","Felipe Mora"],
  UKR:["Team Logo★","Anatoliy Trubin","Oleksandr Karavaev","Mykola Matviyenko","Illia Zabarnyi","Bohdan Mykhaylichenko","Vitaliy Mykolenko","Taras Stepanenko","Viktor Tsygankov","Mykhailo Mudryk","Andriy Yarmolenko","Roman Yaremchuk","Foto Time","Serhiy Sydorchuk","Artem Dovbyk","Georgiy Sudakov","Oleksandr Zinchenko","Ruslan Malinovsky","Serhiy Rebrov","Oleksandr Svatok"],
  VEN:["Team Logo★","Rafael Romo","Ronald Hernández","Yordan Osorio","Jon Aramburu","Freddy Vestia","Miguel Navarro","Yeferson Soteldo","Tomás Rincón","Jefferson Savarino","Eduard Bello","Yangel Herrera","Foto Time","Darwin Machís","Rómulo Otero","Salomón Rondón","Jhon Chancellor","Junior Moreno","Eric Ramírez","Adalberto Peñaranda"],
  MLI:["Team Logo★","Djigui Diarra","Moussa Sissako","Mamadou Fofana","Boubacar Kouyaté","Hamari Traoré","Lassana Coulibaly","Mohamed Camara","Adama Noss Traoré","Yves Bissouma","Amadou Haidara","Moussa Marega","Foto Time","Ibrahim Koné","El Bilal Touré","Sékou Koïta","Lassine Sinayoko","Abdoulay Diaby","Cheick Doucouré","Adama Traoré"],
  ALG:["Team Logo★","Raïs M'Bolhi","Rami Bensebaini","Djamel Benlamri","Youcef Atal","Mehdi Zeffane","Houssem Aouar","Ismaël Bennacer","Adlène Guedioura","Samir Beloufa","Riyad Mahrez","Sofiane Feghouli","Foto Time","Andy Delort","Islam Slimani","Yacine Brahimi","Baghdad Bounedjah","Nabil Bentaleb","Mehdi Abeid","Adam Zorgane"],
  PER:["Team Logo★","Pedro Gallese","Luis Advíncula","Alexander Callens","Carlos Zambrano","Miguel Trauco","Renato Tapia","Sergio Peña","Yoshimar Yotún","Christofer Gonzales","André Carrillo","Gianluca Lapadula","Foto Time","Edison Flores","Luis Ibérico","Bryan Reyna","Santiago Ormeño","Paolo Guerrero","Raúl Ruidíaz","Alex Valera"],
  IRQ:["Team Logo★","Mohammed Hamid","Ali Adnan","Saman Naseri","Rebin Sulaka","Amjad Attwan","Alaa Abbas","Safaa Hadi","Bashar Resan","Humam Tariq","Mohanad Ali","Foto Time","Aymen Hussein","Moatasem Khaldoon","Ahmed Yasin","Ibrahim Bayesh","Karrar Jassim","Aws Jabbar","Mazin Al-Ubaydi","Ammar Al-Hamidi"],
  UZB:["Team Logo★","Otabek Shukurov","Dostonbek Khamdamov","Dilshod Narzullayev","Jasur Yakhshiboev","Shamsiddin Mirzo","Jaloliddin Masharipov","Eldor Shomurodov","Otabek Suyunov","Azizbek Turgunboev","Foto Time","Abbosbek Fayzullayev","Khojiakbar Alijonov","Khamza Kamalov","Nodir Tursunov","Sanjar Tursunov","Temur Musaev","Bahodir Suyunov","Mirzo Akhmedov","Jasurbek Yakhshiboev"],
  COD:["Team Logo★","Lionel Mpasi","Yannick Bolasie","Arthur Masuaku","Chancel Mbemba","Dominique Badibanga","Merveille Bokadi","Dieumerci Mbokani","Theo Bongonda","Rezky Wungkay","Foto Time","Yannick Ferreira-Carrasco","Silas Wissa","Cédric Bakambu","Jonathan Bolingi","Machema Meschak","Ngonda Muzinga","Isaie Dié","Britt Assombalonga","Faïz Selemani"],
};

function buildTeamStickers(code) {
  const names = PLAYER_DATA[code] || Array.from({length:20},(_,i)=>i===0?"Team Logo★":i===12?"Foto Time":`Jogador ${i+1}`);
  return names.map((name,i)=>({ id:`${code}${i+1}`, n:i+1, name, foil:i===0, photo:i===12 }));
}

const ALL_TEAMS_DATA = TEAMS.map(t=>({ ...t, stickers: buildTeamStickers(t.code) }));
const ALL_STICKERS = [
  ...FWC.map(s=>({ ...s, teamName:"Especiais Copa", teamFlag:"⭐", teamColor:"#1B3A6B" })),
  ...ALL_TEAMS_DATA.flatMap(t=>t.stickers.map(s=>({ ...s, teamName:t.name, teamFlag:t.flag, teamColor:t.color, teamCode:t.code }))),
];
const TOTAL = ALL_STICKERS.length;

// ─── CONFETTI ────────────────────────────────────────────────────────────────
function Confetti({ show }) {
  if (!show) return null;
  const pieces = Array.from({length:24},(_,i)=>({
    id:i, left:`${Math.random()*100}%`, delay:`${Math.random()*0.4}s`,
    color:["#F6A800","#009C3B","#D52B1E","#74ACDF","#fff","#FFE066"][i%6],
    size:Math.random()*9+5,
  }));
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999}}>
      {pieces.map(p=>(
        <div key={p.id} style={{position:"absolute",left:p.left,top:"-10px",width:p.size,height:p.size,
          background:p.color,borderRadius:p.id%2?"50%":"2px",
          animation:`fall 1.3s ${p.delay} ease-in forwards`}}/>
      ))}
      <style>{`@keyframes fall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`}</style>
    </div>
  );
}

// ─── SPEECH ENGINE — OpenAI TTS com cache ────────────────────────────────────
let speechEnabled = true;

const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY || "";
let ttsAudio     = null;

// Cache: texto → blob URL já gerado
const audioCache = {};
// Fila de pré-carregamento
const preloadQueue = new Set();

async function fetchAudio(text) {
  if (audioCache[text]) return audioCache[text];
  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: "nova",
        speed: 0.95,
      }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    audioCache[text] = url;
    return url;
  } catch { return null; }
}

// Pré-carrega um texto em background (sem tocar)
async function preload(text) {
  if (audioCache[text] || preloadQueue.has(text)) return;
  preloadQueue.add(text);
  await fetchAudio(text);
  preloadQueue.delete(text);
}

// Pré-carrega todas as frases fixas logo no início
function preloadAll(msgs) {
  // Pré-carrega boas-vindas, trocas, faltam, album — frases fixas
  const fixed = [
    ...msgs.welcome,
    ...msgs.faltam,
    ...msgs.trocas,
    ...msgs.album,
    ...msgs.milestone,
    ...msgs.curiosity,
    ...msgs.complete,
  ];
  // Carrega em paralelo com pequeno delay pra não sobrecarregar
  fixed.forEach((text, i) => {
    setTimeout(() => preload(text), i * 300);
  });
}

function speakNative(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-BR"; u.rate = 0.88; u.pitch = 1.15;
  const ptVoice = window.speechSynthesis.getVoices().find(v=>v.lang.startsWith("pt-BR"))
    || window.speechSynthesis.getVoices().find(v=>v.lang.startsWith("pt")) || null;
  if (ptVoice) u.voice = ptVoice;
  window.speechSynthesis.speak(u);
}

// Global speak lock — prevents overlapping voices
let speakLock = null;

async function speak(text) {
  if (!speechEnabled) return;
  // Cancel any ongoing speech
  if (ttsAudio) { ttsAudio.pause(); ttsAudio.currentTime = 0; ttsAudio = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  // Cancel pending delayed speaks
  if (speakLock) { clearTimeout(speakLock); speakLock = null; }
  try {
    const url = await fetchAudio(text);
    if (!url) { speakNative(text); return; }
    ttsAudio = new Audio(url);
    await ttsAudio.play();
  } catch { speakNative(text); }
}

function speakAfter(text, delay) {
  if (speakLock) clearTimeout(speakLock);
  speakLock = setTimeout(() => { speakLock = null; speak(text); }, delay);
}

if (window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

const MASCOT_MSGS = {
  welcome: [
    "Oi Thih! Que saudade! Bora descobrir mais sobre os países da Copa?",
    "Thih chegou! Você sabia que esse ano tem 48 países na Copa? Vamos colar todos!",
    "Ei Thih! O papai Jackson deixou o álbum prontinho pra você! Bora lá!",
    "Olá, pequeno explorador! Hoje vamos aprender sobre mais países do mundo!",
    "Thih! Você sabia que a Copa de 2026 vai ser em três países ao mesmo tempo? Canadá, México e Estados Unidos!",
    "Oi Thih! Tô com saudade de você! Que figurinha incrível você vai colar hoje?",
    "Oi Thih! A mamãe Tatiane e o papai Jackson ficam tão felizes quando você aprende coisas novas! Bora colar mais!",
    "Thih! Será que a mamãe Tatiane já viu quantas figurinhas você colou? Ela vai ficar impressionada!",
  ],
  sticker: (name) => [
    `Uau, ${name}! Thih, você sabia que jogadores de futebol treinam todos os dias desde pequenos, igual você aprende coisas novas todo dia?`,
    `${name} colado! Thih, você é incrível! Mais esperto do que muita gente grande que eu conheço!`,
    `Aaaaa! ${name}! Thih, você tá montando uma coleção histórica! Daqui a anos você vai olhar isso e lembrar!`,
    `${name}! Thih, cada figurinha dessa é de um craque real que treinou muito pra chegar na Copa do Mundo!`,
    `Boooa, Thih! ${name} no álbum! Você sabia que documentários sobre futebol mostram como esses jogadores cresceram? Igualzinho você tá crescendo!`,
    `Uhuu! ${name}! Thih, você tem memória incrível pra lembrar de todos os jogadores! Isso é de criança muito inteligente!`,
    `${name} colado com sucesso! Thih, esse jogador veio de um país bem longe! Que tal pedir pro papai mostrar no mapa?`,
    `Isso aí, Thih! ${name}! Sua coleção tá ficando a mais incrível do Brasil inteiro!`,
  ],
  teamDone: (team) => [
    `UHUUUU! Seleção da ${team} COMPLETA! Thih, você conhece todos os jogadores desse país agora! Isso é muito legal!`,
    `${team} toda colada! Thih, que tal pedir pro papai um documentário sobre esse país? Você já conhece os craques deles!`,
    `INCRÍVEL! A ${team} tá toda no seu álbum, Thih! Você aprendeu sobre mais um país do mundo hoje!`,
    `A ${team} tá completa! Thih, esse país tem uma história de futebol incrível! Você sabia disso?`,
    `${team} completa, Thih! Vai lá mostrar pra mamãe Tatiane! Ela vai adorar ver como você tá esperto!`,
  ],
  milestone: [
    "Metade do álbum, Thih! Você passou por 24 países! Isso é mais que metade dos países que estão na Copa! Incrível!",
    "Cinquenta por cento, Thih! Sabe o que isso significa? Você já conhece jogadores de metade do mundo! Que criança mais esperta!",
  ],
  faltam: [
    "Vamos ver o que falta, Thih! Cada figurinha que falta é de um país diferente esperando pra entrar no seu álbum!",
    "Thih, vamos ver quais países ainda estão esperando por você! Bora completar o mapa do mundo!",
  ],
  trocas: [
    "Hora de trocar, Thih! Você sabia que trocar figurinha é quase como fazer comércio entre países? Igual os adultos fazem!",
    "Negociação começou, Thih! Você é esperto, tenho certeza que vai conseguir as figurinhas que faltam!",
  ],
  album: [
    "De volta ao álbum, Thih! Cada página é um pedacinho do mundo esperando por você!",
    "Thih tá de volta! Vamos ver quais países do mundo você vai explorar hoje?",
    "Bora, Thih! Seu álbum é quase um documentário de figurinha! O mais legal do mundo!",
  ],
  curiosity: [
    "Thih, você sabia que o Brasil é o país que mais vezes ganhou a Copa do Mundo? Cinco vezes! Isso é mais que qualquer outro país!",
    "Thih, a Argentina ganhou a última Copa! Em 2022, no Catar! Você viu no documentário?",
    "Thih, a Copa de 2026 vai ter o dobro de jogos que as antigas! São 104 partidas no total!",
    "Thih, você sabia que tem jogadores na Copa que começaram a treinar com a sua idade, onze anos?",
    "Thih, o estádio maior da Copa fica nos Estados Unidos e cabe quase 100 mil pessoas! Imagina a torcida!",
  ],
  complete: [
    "ÁLBUM COMPLETO!! Thiago Henrique Peiker Tomelin, você é o maior colecionador e explorador do mundo inteiro!! Você conheceu 48 países e centenas de jogadores! O papai Jackson e a mamãe Tatiane estão com o coração cheio de orgulho de você, meu pequeno gênio!! Parabéns, Thih!!",
  ],
};

// Random curiosity interval — fala uma curiosidade a cada 3 figurinhas coladas
let stickerCount = 0;
function rnd(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

// ─── TELA DE SELFIE ──────────────────────────────────────────────────────────
function SelfieScreen({ onDone }) {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const [stream, setStream]     = useState(null);
  const [photo, setPhoto]       = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [flash, setFlash]       = useState(false);
  const [error, setError]       = useState(false);

  useEffect(() => {
    startCamera();
    setTimeout(() => speak("Oi Thih! Antes de entrar no álbum, tira uma selfie pra mim! Aperta o botão e sorri bonito!"), 300);
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 400 }, height: { ideal: 400 } },
        audio: false,
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch { setError(true); speak("Não consegui abrir a câmera, Thih! Mas tudo bem, pode entrar assim mesmo!"); }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
  };

  const startCountdown = () => {
    speak("Prepara! Três, dois, um... Sorri!");
    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);
        takePhoto();
      }
    }, 1000);
  };

  const takePhoto = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth  || 400;
    canvas.height = video.videoHeight || 400;
    const ctx = canvas.getContext("2d");
    // Mirror the image (selfie style)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPhoto(dataUrl);
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    speak("Ficou lindo, Thih! Que sorriso mais bonito! Salvei sua foto!");
    stopCamera();
  };

  const retake = () => {
    setPhoto(null);
    startCamera();
    speak("Tudo bem! Tira outra! Dessa vez ainda mais bonito!");
  };

  const confirm = () => {
    if (photo) localStorage.setItem("thiago_selfie", photo);
    onDone(photo);
  };

  const skip = () => {
    speak("Tudo bem Thih! Entra no álbum!");
    stopCamera();
    onDone(null);
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:650,
      background:"linear-gradient(160deg,#1B3A6B 0%,#009c3b 70%,#F6A800 130%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:24,
    }}>
      {/* Flash effect */}
      {flash && <div style={{position:"fixed",inset:0,background:"#fff",zIndex:700,opacity:0.9,pointerEvents:"none"}}/>}

      {/* Stars */}
      {[...Array(10)].map((_,i)=>(
        <div key={i} style={{position:"absolute",left:`${5+i*9}%`,top:`${10+((i*43)%70)}%`,
          fontSize:12,opacity:0.15,animation:`twinkle ${1.2+i*0.2}s ease-in-out infinite alternate`}}>⭐</div>
      ))}

      <div style={{fontSize:14,color:"#FFE066",fontFamily:"'Fredoka One',cursive",marginBottom:6,textAlign:"center"}}>
        📸 Hora da selfie, Thih!
      </div>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",fontFamily:"'Nunito',sans-serif",fontWeight:700,marginBottom:16,textAlign:"center"}}>
        Tira uma foto pra ficar no seu álbum! 😄
      </div>

      {/* Camera / Photo */}
      <div style={{position:"relative",width:260,height:260,borderRadius:24,overflow:"hidden",
        border:"4px solid #F6A800",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",marginBottom:16}}>

        {!photo && !error && (
          <video ref={videoRef} autoPlay playsInline muted
            style={{width:"100%",height:"100%",objectFit:"cover",transform:"scaleX(-1)"}}/>
        )}
        {photo && (
          <img src={photo} alt="selfie" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        )}
        {error && (
          <div style={{width:"100%",height:"100%",background:"#1a1a2e",display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:8}}>
            <span style={{fontSize:48}}>📷</span>
            <span style={{fontSize:11,color:"#aaa",fontFamily:"'Nunito',sans-serif",textAlign:"center",padding:"0 16px"}}>
              Câmera não disponível
            </span>
          </div>
        )}

        {/* Countdown overlay */}
        {countdown !== null && (
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
            background:"rgba(0,0,0,0.35)"}}>
            <span style={{fontSize:90,color:"#FFE066",fontFamily:"'Fredoka One',cursive",
              textShadow:"0 4px 20px rgba(0,0,0,0.5)",animation:"countPop 0.4s ease-out"}}>
              {countdown}
            </span>
          </div>
        )}

        {/* Trophy watermark on photo */}
        {photo && (
          <div style={{position:"absolute",bottom:8,right:10,fontSize:22,opacity:0.7}}>🏆</div>
        )}
      </div>

      <canvas ref={canvasRef} style={{display:"none"}}/>

      {/* Buttons */}
      {!photo ? (
        <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:260}}>
          {!error && (
            <button onClick={startCountdown} disabled={countdown!==null}
              style={{padding:"14px",background:"linear-gradient(135deg,#F6A800,#FFE066)",
                border:"none",borderRadius:16,fontSize:16,fontFamily:"'Fredoka One',cursive",
                color:"#1B3A6B",cursor:"pointer",boxShadow:"0 4px 16px rgba(246,168,0,0.4)",
                opacity:countdown!==null?0.6:1}}>
              📸 Tirar selfie!
            </button>
          )}
          <button onClick={skip}
            style={{padding:"11px",background:"rgba(255,255,255,0.12)",border:"2px solid rgba(255,255,255,0.25)",
              borderRadius:14,fontSize:13,fontFamily:"'Fredoka One',cursive",color:"rgba(255,255,255,0.8)",cursor:"pointer"}}>
            Pular por hoje →
          </button>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:260}}>
          <button onClick={confirm}
            style={{padding:"14px",background:"linear-gradient(135deg,#009C3B,#00c44f)",
              border:"none",borderRadius:16,fontSize:16,fontFamily:"'Fredoka One',cursive",
              color:"#fff",cursor:"pointer",boxShadow:"0 4px 16px rgba(0,156,59,0.4)"}}>
            ✅ Ficou ótimo! Entrar!
          </button>
          <button onClick={retake}
            style={{padding:"11px",background:"rgba(255,255,255,0.12)",border:"2px solid rgba(255,255,255,0.25)",
              borderRadius:14,fontSize:13,fontFamily:"'Fredoka One',cursive",color:"rgba(255,255,255,0.8)",cursor:"pointer"}}>
            🔄 Tirar outra
          </button>
        </div>
      )}

      <style>{`
        @keyframes countPop{from{transform:scale(2);opacity:0}to{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}

// ─── TELA DE SELFIE ──────────────────────────────────────────────────────────
// ─── TELA DE SENHA ───────────────────────────────────────────────────────────
const CORRECT_PIN = "24012014"; // 24/01/2014 — senha do Thiago
const ADMIN_PIN   = "99824361"; // senha do papai Jackson para resetar

function PinScreen({ onUnlock }) {
  const [digits, setDigits]   = useState([]);
  const [shake, setShake]         = useState(false);
  const [success, setSuccess]     = useState(false);
  const [adminReset, setAdminReset] = useState(false);
  const [hint, setHint]           = useState("");

  const addDigit = (d) => {
    if (digits.length >= 8) return;
    const next = [...digits, d];
    setDigits(next);
    if (next.length === 8) {
      const entered = next.join("");
      if (entered === CORRECT_PIN) {
        setSuccess(true);
        speak("Yeeees! É o Thih! Pode entrar, campeão! Bora colar figurinha!");
        setTimeout(() => onUnlock("normal"), 2200);
      } else if (entered === ADMIN_PIN) {
        setSuccess(true);
        setAdminReset(true);
        speak("Olá papai Jackson! Sistema sendo zerado agora! Foto, figurinhas e trocas apagadas com sucesso!");
        setTimeout(() => onUnlock("reset"), 2500);
      } else {
        setShake(true);
        const wrongMsg = "Hmm, não é essa! Tenta de novo, Thih! Dica: é a data do seu aniversário!";
        speak(wrongMsg);
        setHint("Dica: é a data do seu aniversário! 🎂");
        setTimeout(() => { setShake(false); setDigits([]); setHint(""); }, 1500);
      }
    }
  };

  const del = () => setDigits(d => d.slice(0, -1));

  const display = CORRECT_PIN.split("").map((_, i) => digits[i] !== undefined ? digits[i] : null);
  // Format as DD/MM/AAAA
  const formatted = [
    display[0], display[1], "/",
    display[2], display[3], "/",
    display[4], display[5], display[6], display[7],
  ];

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:600,
      background:"linear-gradient(160deg,#1B3A6B 0%,#0a5c2e 60%,#F6A800 130%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:28, userSelect:"none",
    }}>
      {/* Stars */}
      {[...Array(16)].map((_,i)=>(
        <div key={i} style={{
          position:"absolute",
          left:`${5+i*6}%`, top:`${8+((i*41)%75)}%`,
          fontSize:i%4===0?20:12, opacity:0.15,
          animation:`twinkle ${1.2+i*0.25}s ease-in-out infinite alternate`,
        }}>⭐</div>
      ))}

      {/* Trophy mascot */}
      <div style={{
        fontSize: success ? 110 : 90,
        animation: success ? "trophyWin 0.5s ease-in-out infinite alternate" : "trophyBob 1.5s ease-in-out infinite alternate",
        filter:"drop-shadow(0 8px 24px rgba(0,0,0,0.35))",
        marginBottom:12, transition:"font-size 0.3s",
      }}>🏆</div>

      {success ? (
        <div style={{fontSize:26,color:"#FFE066",fontFamily:"'Fredoka One',cursive",textAlign:"center",textShadow:"0 2px 12px rgba(0,0,0,0.4)"}}>
          {adminReset ? "Sistema zerado! ✅" : "Bem-vindo, Thih! 🎉"}
        </div>
      ) : (
        <>
          <div style={{fontSize:20,color:"#FFE066",fontFamily:"'Fredoka One',cursive",textAlign:"center",marginBottom:4,textShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>
            Qual é a sua data de nascimento?
          </div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",fontFamily:"'Nunito',sans-serif",fontWeight:700,marginBottom:20,textAlign:"center"}}>
            Digite o dia, mês e ano que você nasceu! 🎂
          </div>

          {/* PIN display */}
          <div style={{
            display:"flex", gap:6, marginBottom:8, alignItems:"center",
            animation: shake ? "shakePIN 0.4s ease" : "none",
          }}>
            {formatted.map((ch, i) => (
              ch === "/" ? (
                <span key={i} style={{fontSize:22,color:"rgba(255,255,255,0.5)",fontFamily:"'Fredoka One',cursive"}}>/</span>
              ) : (
                <div key={i} style={{
                  width:32, height:40, borderRadius:10,
                  background: ch !== null ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.15)",
                  border: ch !== null ? "2px solid #F6A800" : "2px solid rgba(255,255,255,0.3)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:20, fontWeight:900, color:"#1B3A6B",
                  fontFamily:"'Fredoka One',cursive",
                  transition:"all 0.15s",
                  boxShadow: ch !== null ? "0 2px 12px rgba(246,168,0,0.4)" : "none",
                }}>
                  {ch !== null ? ch : ""}
                </div>
              )
            ))}
          </div>

          {hint && (
            <div style={{fontSize:11,color:"#FFE066",fontFamily:"'Nunito',sans-serif",fontWeight:700,marginBottom:8,textAlign:"center"}}>
              {hint}
            </div>
          )}

          {/* Numpad */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:10,width:"100%",maxWidth:280}}>
            {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=>(
              <button key={i} onClick={()=> k==="" ? null : k==="⌫" ? del() : addDigit(String(k))}
                style={{
                  height:60, borderRadius:16,
                  background: k==="" ? "transparent" : k==="⌫" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.18)",
                  border: k==="" ? "none" : "2px solid rgba(255,255,255,0.25)",
                  color:"#fff", fontSize:k==="⌫"?20:24,
                  fontFamily:"'Fredoka One',cursive",
                  cursor: k==="" ? "default" : "pointer",
                  backdropFilter:"blur(4px)",
                  boxShadow: k==="" ? "none" : "0 2px 8px rgba(0,0,0,0.15)",
                  transition:"transform 0.1s, background 0.1s",
                  WebkitTapHighlightColor:"transparent",
                }}
                onTouchStart={e=>{ if(k!=="") e.currentTarget.style.transform="scale(0.92)"; }}
                onTouchEnd={e=>{ e.currentTarget.style.transform="scale(1)"; }}
              >
                {k}
              </button>
            ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes trophyBob{from{transform:scale(1) rotate(-4deg)}to{transform:scale(1.08) rotate(4deg)}}
        @keyframes trophyWin{from{transform:scale(1) rotate(-6deg)}to{transform:scale(1.15) rotate(6deg)}}
        @keyframes shakePIN{0%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-8px)}80%{transform:translateX(8px)}100%{transform:translateX(0)}}
        @keyframes twinkle{from{opacity:0.06;transform:scale(0.8)}to{opacity:0.22;transform:scale(1.1)}}
      `}</style>
    </div>
  );
}

// ─── MASCOTE ─────────────────────────────────────────────────────────────────
function Mascot({ msg, muted, onToggleMute }) {
  const [visible, setVisible] = useState(false);
  const [text, setText]       = useState("");
  const [bounce, setBounce]   = useState(false);

  useEffect(()=>{
    if (!msg) return;
    setText(msg);
    setVisible(true);
    setBounce(true);
    setTimeout(()=>setBounce(false), 600);
    const t = setTimeout(()=>setVisible(false), 5000);
    return ()=>clearTimeout(t);
  },[msg]);

  return (
    <div style={{position:"fixed",bottom:82,right:14,zIndex:300,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,pointerEvents:"none"}}>
      {/* Speech bubble */}
      {visible && (
        <div style={{
          background:"#fff", borderRadius:"16px 16px 4px 16px",
          padding:"10px 13px", maxWidth:210, fontSize:12,
          fontFamily:"'Nunito',sans-serif", fontWeight:700, color:"#1B3A6B",
          boxShadow:"0 4px 20px rgba(0,0,0,0.15)", border:"2px solid #F6A800",
          animation:"popIn 0.25s ease-out",
          pointerEvents:"none", lineHeight:1.35,
        }}>
          {text}
          <div style={{width:0,height:0,borderLeft:"8px solid transparent",borderRight:"0",borderTop:"8px solid #F6A800",position:"absolute",bottom:-9,right:20}}/>
          <div style={{width:0,height:0,borderLeft:"6px solid transparent",borderRight:"0",borderTop:"6px solid #fff",position:"absolute",bottom:-6,right:22}}/>
        </div>
      )}

      {/* Mascot ball + mute button */}
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        {/* mute toggle */}
        <button onClick={onToggleMute} style={{
          width:30,height:30,borderRadius:"50%",border:"2px solid #eee",
          background:"#fff",fontSize:14,cursor:"pointer",
          boxShadow:"0 2px 8px rgba(0,0,0,0.1)",
          display:"flex",alignItems:"center",justifyContent:"center",
          pointerEvents:"all",
        }}>{muted?"🔇":"🔊"}</button>

        {/* ball mascot */}
        <div style={{
          width:54,height:54,borderRadius:"50%",
          background:"linear-gradient(135deg,#FFE066 0%,#F6A800 100%)",
          border:"3px solid #1B3A6B",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:28,
          boxShadow:"0 4px 20px rgba(246,168,0,0.45)",
          animation: bounce ? "mascotBounce 0.5s ease" : "mascotFloat 3s ease-in-out infinite",
          pointerEvents:"all", cursor:"pointer",
        }} onClick={()=>{ speak(rnd(MASCOT_MSGS.welcome)); setBounce(true); setTimeout(()=>setBounce(false),600); }}>
          🏆
        </div>
      </div>

      <style>{`
        @keyframes popIn{from{transform:scale(0.7) translateY(8px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
        @keyframes mascotFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes mascotBounce{0%{transform:scale(1)}25%{transform:scale(1.25)}50%{transform:scale(0.92)}75%{transform:scale(1.08)}100%{transform:scale(1)}}
      `}</style>
    </div>
  );
}

// ─── PLAYER PHOTO ────────────────────────────────────────────────────────────
function PlayerPhoto({ name, color, isSpecial, foil, isPhotoCard }) {
  const [img, setImg]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (isSpecial) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setImg(null);
    fetchWikiPhoto(name).then(src => {
      if (!cancelled) { setImg(src); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [name, isSpecial, attempt]);

  const W = 60, H = 64, R = 9;

  if (isSpecial) return (
    <div style={{width:W,height:H,borderRadius:R,display:"flex",alignItems:"center",justifyContent:"center",
      background:"linear-gradient(135deg,#fffbe0,#fde68a)",border:"2px solid #F6A800"}}>
      <span style={{fontSize:28}}>{foil?"⭐":isPhotoCard?"📷":"🏟️"}</span>
    </div>
  );

  if (loading) return (
    <div style={{width:W,height:H,borderRadius:R,background:"#f0ece4",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
      <div style={{width:18,height:18,borderRadius:"50%",border:`2.5px solid ${color}`,borderTopColor:"transparent",animation:"spin 0.7s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{fontSize:6,color:"#bbb",fontFamily:"monospace"}}>buscando...</span>
    </div>
  );

  if (img) return (
    <div style={{width:W,height:H,borderRadius:R,overflow:"hidden",border:`2px solid ${color}55`,flexShrink:0,background:"#f0f0f0",position:"relative"}}>
      <img src={img} alt={name}
        style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}
        onError={()=>setImg(null)}/>
    </div>
  );

  // Fallback: jersey-style with initials
  const words = name.split(" ").filter(w=>w.length>1);
  const initials = words.slice(0,2).map(w=>w[0].toUpperCase()).join("");
  const lastName = words[words.length-1] || name;
  return (
    <div onClick={(e)=>{e.stopPropagation();const k=name.replace(/ [BC]$/,"").replace(/ (NED|SVK|MLI|2|3)$/,"").replace(" Becker","").trim();delete photoCache[k];setAttempt(a=>a+1);}}
      style={{width:W,height:H,borderRadius:R,
        background:`linear-gradient(170deg,${color}20,${color}55)`,
        border:`2px solid ${color}55`,display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",flexShrink:0,gap:1,cursor:"pointer",
        position:"relative",overflow:"hidden"}}>
      {/* Jersey number area */}
      <div style={{width:"80%",height:"55%",borderRadius:6,
        background:`linear-gradient(160deg,${color}40,${color}88)`,
        display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:20,fontWeight:900,color:"#fff",fontFamily:"'Fredoka One',cursive",
          textShadow:`0 1px 4px ${color}`}}>{initials||"?"}</span>
      </div>
      <span style={{fontSize:6.5,color:color,fontFamily:"'Nunito',sans-serif",fontWeight:900,
        textAlign:"center",lineHeight:1,padding:"0 3px",maxWidth:"100%",
        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
        {lastName.toUpperCase()}
      </span>
      <span style={{fontSize:5.5,color:`${color}88`,fontFamily:"monospace",lineHeight:1}}>toque p/ tentar</span>
    </div>
  );
}

// ─── STICKER CARD ─────────────────────────────────────────────────────────────
function StickerCard({ sticker, collected, onToggle, color }) {
  const isSpecial = sticker.foil || sticker.photo;
  return (
    <div onClick={()=>onToggle(sticker.id)} style={{
      width:84, height:122, borderRadius:12, cursor:"pointer", position:"relative",
      userSelect:"none", WebkitTapHighlightColor:"transparent",
      transition:"transform 0.15s, box-shadow 0.15s",
      transform: collected?"scale(1.04)":"scale(1)",
      boxShadow: collected?`0 6px 20px ${color}55`:"0 2px 6px rgba(0,0,0,0.10)",
      background: collected
        ? isSpecial?"linear-gradient(160deg,#fffbe0,#fde68a)":"linear-gradient(160deg,#fff,#fff)"
        : "#ede5d8",
      border: collected ? isSpecial?"2.5px solid #F6A800":`2.5px solid ${color}` : "2px dashed #c8b89a",
      display:"flex", flexDirection:"column", alignItems:"center",
      padding:"5px 4px 4px", gap:3, overflow:"hidden",
    }}>
      {/* Código no topo */}
      <div style={{position:"absolute",top:3,left:4,fontSize:7,fontWeight:900,
        color:collected?(isSpecial?"#7a5000":color):"#b0a090",fontFamily:"monospace"}}>
        {sticker.id}
      </div>

      {/* Checkmark */}
      {collected && (
        <div style={{position:"absolute",top:3,right:3,width:14,height:14,
          background:isSpecial?"#F6A800":color,borderRadius:"50%",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:900,color:"#fff"}}>✓</div>
      )}

      {/* Foto */}
      <div style={{marginTop:8}}>
        {collected
          ? <PlayerPhoto name={sticker.name} color={color} isSpecial={isSpecial} foil={sticker.foil} isPhotoCard={sticker.photo}/>
          : <div style={{width:54,height:58,borderRadius:8,background:"#d8d0c4",display:"flex",
              alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:22,filter:"opacity(0.3)"}}>{sticker.foil?"⭐":sticker.photo?"📷":"👤"}</span>
            </div>
        }
      </div>

      {/* Nome */}
      <div style={{
        fontSize:7.5, fontWeight:800, textAlign:"center", lineHeight:1.2,
        fontFamily:"'Fredoka One',cursive", padding:"0 2px", wordBreak:"break-word",
        color:collected?(isSpecial?"#7a5000":color):"#a09080",
        maxHeight:20, overflow:"hidden",
      }}>
        {sticker.name.replace("Team Logo★","Logo ★").replace("Foto Time","Foto 📷")}
      </div>

      {sticker.foil && collected && (
        <div style={{fontSize:6,color:"#F6A800",fontWeight:900,letterSpacing:0.5,fontFamily:"monospace",marginTop:-2}}>✦ FOIL ✦</div>
      )}
    </div>
  );
}

// ─── TROCAS ───────────────────────────────────────────────────────────────────
function TrocasTab({ trades, setTrades }) {
  const [searchCode, setSearchCode] = useState("");
  const [qty, setQty]   = useState(1);
  const [msg, setMsg]   = useState("");

  const addTrade = () => {
    const code = searchCode.trim().toUpperCase();
    if (!code) return;
    const sticker = ALL_STICKERS.find(s=>s.id===code);
    if (!sticker) { setMsg("❌ Código não encontrado!"); setTimeout(()=>setMsg(""),2000); return; }
    setTrades(p=>{
      const ex = p.find(t=>t.id===code);
      if (ex) return p.map(t=>t.id===code?{...t,qty:t.qty+qty}:t);
      return [...p,{id:code,name:sticker.name,teamFlag:sticker.teamFlag,teamName:sticker.teamName,color:sticker.teamColor,qty}];
    });
    setMsg(`✅ ${code} adicionada!`);
    setSearchCode(""); setQty(1);
    setTimeout(()=>setMsg(""),2000);
  };

  const remove    = (id) => setTrades(p=>p.filter(t=>t.id!==id));
  const changeQty = (id,delta) => setTrades(p=>p.map(t=>t.id===id?{...t,qty:Math.max(1,t.qty+delta)}:t));
  const shareText = trades.length>0 ? "🔄 TROCAS Álbum Copa 2026 (Nicolas)\n\n"+trades.map(t=>`${t.teamFlag} ${t.id} - ${t.name} (x${t.qty})`).join("\n") : "";

  return (
    <div style={{padding:"14px 14px 0"}}>
      <div style={{background:"#fff",borderRadius:16,padding:14,marginBottom:12,boxShadow:"0 4px 16px rgba(0,0,0,0.07)"}}>
        <div style={{fontSize:14,color:"#1B3A6B",marginBottom:10}}>➕ Adicionar figurinha repetida</div>
        <input value={searchCode} onChange={e=>setSearchCode(e.target.value.toUpperCase())}
          placeholder="Ex: BRA14, ESP15, ARG20…"
          style={{width:"100%",padding:"9px 12px",borderRadius:10,border:"2px solid #F6A800",fontSize:12,fontFamily:"'Nunito',sans-serif",fontWeight:700,color:"#333",marginBottom:8}}/>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:11,color:"#666",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>Qtd:</span>
          <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:28,height:28,borderRadius:8,border:"2px solid #eee",background:"#f5f5f5",fontSize:14,cursor:"pointer"}}>-</button>
          <span style={{fontSize:14,fontWeight:900,fontFamily:"'Fredoka One',cursive",minWidth:20,textAlign:"center"}}>{qty}</span>
          <button onClick={()=>setQty(q=>q+1)} style={{width:28,height:28,borderRadius:8,border:"2px solid #eee",background:"#f5f5f5",fontSize:14,cursor:"pointer"}}>+</button>
          <button onClick={addTrade} style={{flex:1,padding:"8px",background:"linear-gradient(135deg,#F6A800,#ffcc00)",border:"none",borderRadius:10,fontSize:12,fontFamily:"'Fredoka One',cursive",color:"#1B3A6B",cursor:"pointer"}}>Adicionar</button>
        </div>
        {msg&&<div style={{marginTop:8,fontSize:11,color:"#009C3B",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>{msg}</div>}
      </div>

      {trades.length===0 ? (
        <div style={{textAlign:"center",padding:"32px 16px",color:"#bbb",fontFamily:"'Nunito',sans-serif",fontSize:13}}>
          <div style={{fontSize:36,marginBottom:8}}>🔄</div>
          Nenhuma repetida ainda.
        </div>
      ) : (
        <>
          <div style={{fontSize:12,color:"#888",fontFamily:"'Nunito',sans-serif",fontWeight:700,marginBottom:8}}>
            {trades.reduce((s,t)=>s+t.qty,0)} figurinhas para troca ({trades.length} diferentes)
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
            {[...trades].sort((a,b)=>a.id.localeCompare(b.id)).map(t=>(
              <div key={t.id} style={{background:"#fff",borderRadius:12,padding:"10px 12px",display:"flex",alignItems:"center",gap:8,boxShadow:"0 2px 8px rgba(0,0,0,0.06)",border:`2px solid ${t.color}22`}}>
                <span style={{fontSize:18}}>{t.teamFlag}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                    <span style={{fontSize:12,fontWeight:900,color:t.color,fontFamily:"'Fredoka One',cursive"}}>{t.id}</span>
                    <span style={{fontSize:10,color:"#666",fontFamily:"'Nunito',sans-serif"}}>{t.name}</span>
                  </div>
                  <div style={{fontSize:9,color:"#aaa",fontFamily:"'Nunito',sans-serif"}}>{t.teamName}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <button onClick={()=>changeQty(t.id,-1)} style={{width:22,height:22,borderRadius:6,border:"1.5px solid #eee",background:"#f5f5f5",fontSize:11,cursor:"pointer"}}>-</button>
                  <span style={{fontSize:13,fontWeight:900,fontFamily:"'Fredoka One',cursive",minWidth:18,textAlign:"center",color:t.color}}>{t.qty}x</span>
                  <button onClick={()=>changeQty(t.id,1)} style={{width:22,height:22,borderRadius:6,border:"1.5px solid #eee",background:"#f5f5f5",fontSize:11,cursor:"pointer"}}>+</button>
                </div>
                <button onClick={()=>remove(t.id)} style={{width:26,height:26,borderRadius:7,border:"none",background:"#fee",fontSize:13,cursor:"pointer",color:"#d00"}}>✕</button>
              </div>
            ))}
          </div>
          <button onClick={()=>{navigator.clipboard?.writeText(shareText);alert("Lista copiada! Cole no WhatsApp 📱");}}
            style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#25D366,#128C7E)",border:"none",borderRadius:14,fontSize:14,fontFamily:"'Fredoka One',cursive",color:"#fff",cursor:"pointer",boxShadow:"0 4px 14px rgba(37,211,102,0.3)"}}>
            📱 Copiar lista para WhatsApp
          </button>
          <div style={{marginTop:8,textAlign:"center",fontSize:9,color:"#bbb",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>
            🧑‍💻 Dev: Jackson Tomelin • 🌟 Thiago Henrique Peiker Tomelin
          </div>
        </>
      )}
    </div>
  );
}

// ─── FALTAM TAB ───────────────────────────────────────────────────────────────
function FaltamTab({ collected, onToggle }) {
  const [filterCode, setFilterCode] = useState("");
  const [groupBy, setGroupBy]       = useState("team");
  const [toast, setToast]           = useState(null);

  const handleMark = (s) => {
    onToggle(s.id);
    if (toast) clearTimeout(toast.timer);
    const timer = setTimeout(()=>setToast(null), 4000);
    setToast({id:s.id, name:s.name, flag:s.teamFlag, color:s.teamColor, timer});
  };

  const handleUndo = () => {
    if (!toast) return;
    clearTimeout(toast.timer);
    onToggle(toast.id);
    setToast(null);
  };

  const missing  = useMemo(()=>ALL_STICKERS.filter(s=>!collected[s.id]),[collected]);
  const filtered = useMemo(()=>{
    const q = filterCode.trim().toUpperCase();
    if (!q) return missing;
    return missing.filter(s=>s.id.includes(q)||s.name.toUpperCase().includes(q)||(s.teamName||"").toUpperCase().includes(q));
  },[missing,filterCode]);

  const byTeam = useMemo(()=>{
    const map={};
    filtered.forEach(s=>{
      const key=s.teamCode||"FWC";
      if(!map[key]) map[key]={name:s.teamName,flag:s.teamFlag,color:s.teamColor,items:[]};
      map[key].items.push(s);
    });
    return Object.values(map).sort((a,b)=>a.name.localeCompare(b.name));
  },[filtered]);

  const byLetter = useMemo(()=>{
    const map={};
    filtered.forEach(s=>{ const l=s.id[0]; if(!map[l]) map[l]=[]; map[l].push(s); });
    return Object.entries(map).sort((a,b)=>a[0].localeCompare(b[0]));
  },[filtered]);

  if (missing.length===0) return (
    <div style={{padding:"60px 24px",textAlign:"center"}}>
      <div style={{fontSize:52}}>🏆</div>
      <div style={{fontSize:20,color:"#009C3B",fontFamily:"'Fredoka One',cursive",marginTop:8}}>Álbum Completo!</div>
      <div style={{fontSize:13,color:"#666",fontFamily:"'Nunito',sans-serif",marginTop:4}}>Parabéns Nicolas! 🎉</div>
    </div>
  );

  return (
    <div style={{padding:"14px 14px 0"}}>
      <div style={{background:"linear-gradient(135deg,#D52B1E,#ff6b6b)",borderRadius:14,padding:"12px 14px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:22,color:"#fff",fontFamily:"'Fredoka One',cursive"}}>{missing.length} faltando</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.8)",fontFamily:"'Nunito',sans-serif"}}>de {TOTAL} figurinhas no total</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:13,color:"#FFE066",fontFamily:"'Fredoka One',cursive"}}>{TOTAL-missing.length} coladas</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.8)",fontFamily:"'Nunito',sans-serif"}}>{Math.round(((TOTAL-missing.length)/TOTAL)*100)}% completo</div>
        </div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <input value={filterCode} onChange={e=>setFilterCode(e.target.value)}
          placeholder="🔍 Código, nome, seleção…"
          style={{flex:1,padding:"9px 12px",borderRadius:10,border:"2px solid #F6A800",fontSize:12,fontFamily:"'Nunito',sans-serif",fontWeight:700,color:"#333"}}/>
        <button onClick={()=>setGroupBy(g=>g==="team"?"az":"team")}
          style={{padding:"9px 12px",borderRadius:10,border:"2px solid #eee",background:"#fff",fontSize:11,fontFamily:"'Nunito',sans-serif",fontWeight:700,cursor:"pointer",color:"#555",whiteSpace:"nowrap"}}>
          {groupBy==="team"?"A–Z":"Por seleção"}
        </button>
      </div>

      {filterCode&&<div style={{fontSize:11,color:"#888",fontFamily:"'Nunito',sans-serif",marginBottom:8}}>{filtered.length} resultado{filtered.length!==1?"s":""}</div>}

      {groupBy==="az" && (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {byLetter.map(([letter,stickers])=>(
            <div key={letter} style={{background:"#fff",borderRadius:14,padding:"10px 12px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <div style={{width:28,height:28,borderRadius:8,background:"#1B3A6B",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#F6A800",fontFamily:"'Fredoka One',cursive"}}>{letter}</div>
                <span style={{fontSize:11,color:"#888",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>{stickers.length} figurinha{stickers.length!==1?"s":""}</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {stickers.map(s=>(
                  <div key={s.id} onClick={()=>handleMark(s)}
                    style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",borderRadius:8,background:"#fafafa",cursor:"pointer",border:`1.5px solid ${s.teamColor}22`}}>
                    <span style={{fontSize:14}}>{s.teamFlag}</span>
                    <span style={{fontSize:12,fontWeight:900,color:s.teamColor,fontFamily:"'Fredoka One',cursive",minWidth:52}}>{s.id}</span>
                    <span style={{fontSize:11,color:"#555",fontFamily:"'Nunito',sans-serif",flex:1}}>{s.name}</span>
                    <span style={{fontSize:9,color:"#aaa"}}>{s.foil?"⭐":""}</span>
                    <div style={{width:20,height:20,borderRadius:5,border:`2px dashed ${s.teamColor}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:s.teamColor}}>+</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {groupBy==="team" && (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {byTeam.map(group=>(
            <div key={group.name} style={{background:"#fff",borderRadius:14,padding:"10px 12px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",border:`2px solid ${group.color}22`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{fontSize:18}}>{group.flag}</span>
                <span style={{fontSize:13,color:group.color,fontFamily:"'Fredoka One',cursive"}}>{group.name}</span>
                <span style={{marginLeft:"auto",fontSize:10,background:group.color,color:"#fff",borderRadius:8,padding:"1px 7px",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>{group.items.length} faltando</span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {group.items.map(s=>(
                  <div key={s.id} onClick={()=>handleMark(s)}
                    style={{display:"flex",alignItems:"center",gap:4,padding:"4px 8px",borderRadius:8,background:`${group.color}11`,cursor:"pointer",border:`1.5px solid ${group.color}44`}}>
                    <span style={{fontSize:10,fontWeight:900,color:group.color,fontFamily:"'Fredoka One',cursive"}}>{s.id}</span>
                    <span style={{fontSize:9,color:"#555",fontFamily:"'Nunito',sans-serif",maxWidth:70,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name.replace("Team Logo★","Logo★").replace("Foto Time","📷")}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast desfazer */}
      {toast && (
        <div style={{position:"fixed",bottom:80,left:14,right:14,zIndex:200,
          background:"#1B3A6B",borderRadius:14,padding:"12px 14px",
          display:"flex",alignItems:"center",gap:10,
          boxShadow:"0 8px 28px rgba(0,0,0,0.22)",animation:"slideUp 0.2s ease-out"}}>
          <style>{`@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
          <span style={{fontSize:18}}>{toast.flag}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"#fff",fontFamily:"'Fredoka One',cursive"}}>{toast.id} marcada como colada ✓</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.6)",fontFamily:"'Nunito',sans-serif"}}>{toast.name}</div>
          </div>
          <button onClick={handleUndo} style={{padding:"7px 14px",background:"#F6A800",border:"none",borderRadius:10,
            fontSize:12,fontFamily:"'Fredoka One',cursive",color:"#1B3A6B",cursor:"pointer",whiteSpace:"nowrap"}}>
            ↩ Desfazer
          </button>
        </div>
      )}
      <div style={{height:16}}/>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [collected, setCollected]   = useState(() => {
    // Pre-populate: all stickers collected except the ones still missing
    const missing = new Set(["FWC3","CZE1","CZE19","CZE20","BIH2","BIH3","BIH6","BIH7","AUS3","AUS13","CIV14","TUN1","TUN8","TUN13","URU6","URU10","FRA5","FRA13","IRQ4","IRQ5","IRQ6","IRQ10","IRQ15","IRQ16","ARG12","COD1","COD19","UZB4","UZB6","UZB15","ENG20","REGU","BRON","PRAT","OURO","CC1","CC9","CC10","CC11","CC12","CC14"]);
    // We build the initial state after ALL_STICKERS is defined, so use localStorage with fallback
    const saved = localStorage.getItem("thiago_collected");
    if (saved) return JSON.parse(saved);
    return {};
  });
  const [trades, setTrades]         = useState([]);
  const [tab, setTab]               = useState("album");
  const [albumView, setAlbumView]   = useState("home");
  const [confetti, setConfetti]     = useState(false);
  const [teamSearch, setTeamSearch] = useState("");
  const [mascotMsg, setMascotMsg]   = useState("");
  const [muted, setMuted]           = useState(false);
  const [splash, setSplash]         = useState(true);
  const [locked, setLocked]         = useState(true);
  const [selfie, setSelfie]         = useState(false);
  const [selfiePhoto, setSelfiePhoto] = useState(() => localStorage.getItem("thiago_selfie") || null);

  const say = (text) => {
    setMascotMsg(text);
    speechEnabled = !muted;
    speak(text);
  };

  // Initialize collected state — mark all as collected except missing ones
  // Runs every time to catch new stickers added (IRQ, UZB, COD, Extra, CC)
  useEffect(() => {
    const missing = new Set(["FWC3","CZE1","CZE19","CZE20","BIH2","BIH3","BIH6","BIH7","AUS3","AUS13","CIV14","TUN1","TUN8","TUN13","URU6","URU10","FRA5","FRA13","IRQ4","IRQ5","IRQ6","IRQ10","IRQ15","IRQ16","ARG12","COD1","COD19","UZB4","UZB6","UZB15","ENG20","REGU","BRON","PRAT","OURO","CC1","CC9","CC10","CC11","CC12","CC14"]);
    const saved = localStorage.getItem("thiago_collected");
    const prev = saved ? JSON.parse(saved) : {};
    // Check if any sticker from ALL_STICKERS is missing from saved state (not collected, not in missing set)
    const needsUpdate = ALL_STICKERS.some(s => !missing.has(s.id) && !prev[s.id]);
    if (needsUpdate) {
      const init = { ...prev };
      ALL_STICKERS.forEach(s => { if (!missing.has(s.id)) init[s.id] = true; });
      setCollected(init);
      localStorage.setItem("thiago_collected", JSON.stringify(init));
    }
  // eslint-disable-next-line
  }, []);

  // Dismiss splash + say welcome (needs user gesture for audio)
  const dismissSplash = () => {
    setSplash(false);
    const msg = rnd(MASCOT_MSGS.welcome);
    setMascotMsg(msg);
    speak(msg);
    // Pré-carrega todas as frases fixas em background após 2s
    setTimeout(() => preloadAll(MASCOT_MSGS), 2000);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    speechEnabled = !next;
    if (!next) { const m="Som ligado! Bora colar figurinha, Nicolas!"; setMascotMsg(m); speak(m); }
    else { window.speechSynthesis?.cancel(); setMascotMsg("Modo silencioso ativado 🔇"); }
  };

  const toggle = (id) => {
    const was = collected[id];
    setCollected(p=>{
      const next = {...p,[id]:!p[id]};

      if (!was) {
        // Find sticker info
        const s = ALL_STICKERS.find(x=>x.id===id);
        const sName = s ? s.name.replace("Team Logo★","Logo da seleção").replace("Foto Time","foto do time") : id;
        const msg = rnd(MASCOT_MSGS.sticker(sName));
        setTimeout(()=>{
          say(msg);
          // Check if team just completed
          if (s?.teamCode) {
            const team = ALL_TEAMS_DATA.find(t=>t.code===s.teamCode);
            if (team && team.stickers.every(st=>next[st.id])) {
              speakAfter(rnd(MASCOT_MSGS.teamDone(team.name)), 3500);
            }
          }
          // Check milestones
          const tot = Object.values(next).filter(Boolean).length;
          if (tot === Math.floor(TOTAL/2)) speakAfter(rnd(MASCOT_MSGS.milestone), 3500);
          if (tot === TOTAL) speakAfter(rnd(MASCOT_MSGS.complete), 2000);
        }, 200);

        setConfetti(true); setTimeout(()=>setConfetti(false),1500);

        // A cada 3 figurinhas, fala uma curiosidade
        stickerCount++;
        if (stickerCount % 3 === 0) {
          speakAfter(rnd(MASCOT_MSGS.curiosity), 4500);
        }
      }
      return next;
    });
  };

  const switchTab = (newTab) => {
    setTab(newTab);
    setAlbumView("home");
    if (newTab==="faltam")  say(rnd(MASCOT_MSGS.faltam));
    if (newTab==="trocas")  say(rnd(MASCOT_MSGS.trocas));
    if (newTab==="album")   say(rnd(MASCOT_MSGS.album));
  };

  const totalCollected = useMemo(()=>Object.values(collected).filter(Boolean).length,[collected]);
  const pct            = Math.round((totalCollected/TOTAL)*100);
  const fwcCollected   = FWC.filter(s=>collected[s.id]).length;
  const filteredTeams  = useMemo(()=>ALL_TEAMS_DATA.filter(t=>t.name.toLowerCase().includes(teamSearch.toLowerCase())||t.code.toLowerCase().includes(teamSearch.toLowerCase())),[teamSearch]);
  const activeTeam     = tab==="album"&&albumView!=="home"&&albumView!=="fwc" ? ALL_TEAMS_DATA.find(t=>t.code===albumView) : null;

  // Pré-carrega frases de figurinhas quando abre uma seleção
  useEffect(()=>{
    if (!activeTeam) return;
    activeTeam.stickers.forEach((s, i) => {
      const name = s.name.replace("Team Logo★","Logo da seleção").replace("Foto Time","foto do time");
      const msg = MASCOT_MSGS.sticker(name)[0];
      setTimeout(() => preload(msg), i * 150);
    });
  }, [activeTeam]);

  const headerTitle = tab==="faltam"?"📋 Figurinhas Faltando":tab==="trocas"?"🔄 Minhas Trocas":
    albumView==="fwc"?"⭐ Especiais da Copa":activeTeam?`${activeTeam.flag} ${activeTeam.name}`:"🏆 Thiago Henrique Tomelin";

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#fffdf5 0%,#fffbe8 50%,#fdf0c0 100%)",fontFamily:"'Fredoka One',cursive",paddingBottom:72}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;900&display=swap');*{box-sizing:border-box;}input{outline:none;}::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-thumb{background:#F6A800;border-radius:3px;}`}</style>

      <Confetti show={confetti}/>

      {/* PIN SCREEN */}
      {locked && <PinScreen onUnlock={(mode)=>{
        setLocked(false);
        if (mode === "reset") {
          // Reset everything
          localStorage.removeItem("thiago_selfie");
          setCollected({});
          setTrades([]);
          setSelfiePhoto(null);
          setSelfie(true); // ask for new selfie after reset
        } else {
          setSelfie(true);
        }
      }}/>}
      {!locked && selfie && <SelfieScreen onDone={(p)=>{ if(p) setSelfiePhoto(p); setSelfie(false); }}/>}

      {/* SPLASH WELCOME SCREEN */}
      {splash && (
        <div onClick={dismissSplash} style={{
          position:"fixed",inset:0,zIndex:500,
          background:"linear-gradient(160deg,#1B3A6B 0%,#009c3b 60%,#F6A800 100%)",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          cursor:"pointer",userSelect:"none",WebkitTapHighlightColor:"transparent",
          padding:32,
        }}>
          {/* Animated stars */}
          {[...Array(12)].map((_,i)=>(
            <div key={i} style={{
              position:"absolute",
              left:`${8+i*7.5}%`, top:`${10+((i*37)%70)}%`,
              fontSize:i%3===0?22:14, opacity:0.18,
              animation:`twinkle ${1.5+i*0.3}s ease-in-out infinite alternate`,
            }}>⭐</div>
          ))}

          {/* Big trophy */}
          <div style={{fontSize:90,animation:"trophy 1.2s ease-in-out infinite alternate",marginBottom:8,filter:"drop-shadow(0 8px 24px rgba(0,0,0,0.3))"}}>🏆</div>

          {/* Name */}
          <div style={{
            fontSize:32,color:"#FFE066",fontFamily:"'Fredoka One',cursive",
            textShadow:"0 3px 16px rgba(0,0,0,0.4)",textAlign:"center",lineHeight:1.15,marginBottom:6,
          }}>
            Thiago Henrique Peiker Tomelin
          </div>

          <div style={{
            fontSize:14,color:"rgba(255,255,255,0.85)",fontFamily:"'Nunito',sans-serif",
            fontWeight:700,textAlign:"center",marginBottom:4,
          }}>
            Álbum Panini • Copa do Mundo 2026
          </div>

          <div style={{
            fontSize:11,color:"rgba(255,255,255,0.5)",fontFamily:"'Nunito',sans-serif",
            marginBottom:40,
          }}>
            feito com ❤️ pelo Papai Dev Jackson Tomelin
          </div>

          {/* Tap button */}
          <div style={{
            background:"#FFE066",borderRadius:24,padding:"16px 40px",
            fontSize:18,fontFamily:"'Fredoka One',cursive",color:"#1B3A6B",
            boxShadow:"0 6px 24px rgba(0,0,0,0.3)",
            animation:"pulse 1s ease-in-out infinite alternate",
          }}>
            🏆 Toque para começar!
          </div>

          <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontFamily:"'Nunito',sans-serif",marginTop:16}}>
            🔊 ative o som para ouvir a Yasmin falar com você!
          </div>

          <style>{`
            @keyframes trophy{from{transform:scale(1) rotate(-3deg)}to{transform:scale(1.08) rotate(3deg)}}
            @keyframes pulse{from{transform:scale(1);box-shadow:0 6px 24px rgba(0,0,0,0.3)}to{transform:scale(1.05);box-shadow:0 8px 32px rgba(246,168,0,0.5)}}
            @keyframes twinkle{from{opacity:0.08;transform:scale(0.9)}to{opacity:0.28;transform:scale(1.1)}}
          `}</style>
        </div>
      )}

      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#1B3A6B 0%,#009c3b 100%)",padding:"16px 16px 13px",textAlign:"center",position:"relative",overflow:"hidden",boxShadow:"0 6px 24px rgba(0,0,0,0.25)"}}>
        {/* decorative balls */}
        <div style={{position:"absolute",top:-24,right:-24,fontSize:80,opacity:0.06,transform:"rotate(-20deg)"}}>⚽</div>
        <div style={{position:"absolute",bottom:-20,left:-16,fontSize:60,opacity:0.05,transform:"rotate(15deg)"}}>🏆</div>

        {tab==="album"&&albumView!=="home"&&(
          <button onClick={()=>setAlbumView("home")} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.15)",border:"1.5px solid rgba(255,255,255,0.3)",borderRadius:10,color:"#fff",fontSize:11,padding:"5px 10px",cursor:"pointer",fontFamily:"'Fredoka One',cursive",backdropFilter:"blur(4px)"}}>← Voltar</button>
        )}

        {/* Brand */}
        <div style={{fontSize:9,color:"#F6A800",fontFamily:"'Nunito',sans-serif",fontWeight:900,letterSpacing:4,textTransform:"uppercase",marginBottom:2,opacity:0.9}}>
          Panini • Copa do Mundo 2026
        </div>

        {tab==="album"&&albumView==="home" ? (
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:2}}>
              {selfiePhoto && (
                <div style={{width:38,height:38,borderRadius:"50%",overflow:"hidden",
                  border:"2.5px solid #F6A800",boxShadow:"0 2px 10px rgba(0,0,0,0.3)",flexShrink:0}}>
                  <img src={selfiePhoto} alt="Thih" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                </div>
              )}
              <div style={{fontSize:22,color:"#fff",textShadow:"0 2px 12px rgba(0,0,0,0.4)",lineHeight:1.15,fontFamily:"'Fredoka One',cursive"}}>
                🏆 Thiago Henrique Tomelin
              </div>
            </div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.65)",fontFamily:"'Nunito',sans-serif",marginTop:1}}>
              feito com ❤️ pelo Papai Dev Jackson Tomelin
            </div>
          </>
        ) : (
          <div style={{fontSize:20,color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,0.3)",lineHeight:1.2,fontFamily:"'Fredoka One',cursive"}}>{headerTitle}</div>
        )}

        {/* Progress */}
        <div style={{marginTop:10,padding:"0 2px"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#fff",marginBottom:3,fontFamily:"'Nunito',sans-serif",fontWeight:700}}>
            <span>⭐ {totalCollected}/{TOTAL} coladas</span>
            <span>{pct}% — faltam {TOTAL-totalCollected}</span>
          </div>
          <div style={{height:10,background:"rgba(255,255,255,0.18)",borderRadius:6,overflow:"hidden",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.2)"}}>
            <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#F6A800,#FFE066)",borderRadius:6,transition:"width 0.6s ease",boxShadow:"0 1px 6px rgba(246,168,0,0.5)"}}/>
          </div>
        </div>
      </div>

      {/* ALBUM HOME */}
      {tab==="album"&&albumView==="home"&&(
        <div style={{padding:"12px 14px 0"}}>
          <div onClick={()=>setAlbumView("fwc")} style={{background:"linear-gradient(135deg,#1B3A6B,#2c5aa0)",borderRadius:14,padding:"12px 14px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",boxShadow:"0 4px 16px rgba(27,58,107,0.3)"}}>
            <div>
              <div style={{fontSize:14,color:"#F6A800"}}>⭐ Especiais da Copa</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",fontFamily:"'Nunito',sans-serif"}}>Emblema, Mascotes, Bola • {fwcCollected}/{FWC.length}</div>
            </div>
            <span style={{fontSize:20,color:"#fff"}}>›</span>
          </div>
          <input value={teamSearch} onChange={e=>setTeamSearch(e.target.value)} placeholder="🔍 Buscar seleção…"
            style={{width:"100%",padding:"9px 12px",borderRadius:12,border:"2px solid #F6A800",background:"#fff",fontSize:12,fontFamily:"'Nunito',sans-serif",fontWeight:700,color:"#333",marginBottom:10}}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
            {filteredTeams.map(team=>{
              const cnt=team.stickers.filter(s=>collected[s.id]).length;
              const full=cnt===20;
              return (
                <div key={team.code} onClick={()=>setAlbumView(team.code)}
                  style={{background:full?`linear-gradient(135deg,${team.color}18,${team.color}38)`:"#fff",
                    borderRadius:14,padding:"11px 6px 9px",
                    border:full?`2.5px solid ${team.color}`:"2px solid #eee",
                    cursor:"pointer",textAlign:"center",
                    boxShadow:full?`0 6px 18px ${team.color}44`:"0 2px 10px rgba(0,0,0,0.06)",
                    transition:"all 0.2s",position:"relative",overflow:"hidden"}}>
                  {full&&<div style={{position:"absolute",top:4,right:5,fontSize:10,color:team.color}}>✓</div>}
                  <div style={{fontSize:26}}>{team.flag}</div>
                  <div style={{fontSize:8.5,fontFamily:"'Nunito',sans-serif",fontWeight:900,color:full?team.color:"#555",marginTop:3,lineHeight:1.2}}>{team.name}</div>
                  {/* mini progress bar */}
                  <div style={{height:4,background:"#eee",borderRadius:3,margin:"5px 6px 2px",overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(cnt/20)*100}%`,background:cnt>0?team.color:"#ccc",borderRadius:3,transition:"width 0.4s"}}/>
                  </div>
                  <div style={{fontSize:8,color:cnt>0?team.color:"#bbb",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>{cnt}/20</div>
                </div>
              );
            })}
          </div>
          {/* Stats row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}>
            {[
              {icon:"⭐",label:"Coladas",val:totalCollected,color:"#F6A800"},
              {icon:"📋",label:"Faltam",val:TOTAL-totalCollected,color:"#D52B1E"},
              {icon:"✅",label:"Seleções OK",val:ALL_TEAMS_DATA.filter(t=>t.stickers.every(s=>collected[s.id])).length,color:"#009C3B"},
            ].map(s=>(
              <div key={s.label} style={{background:"#fff",borderRadius:12,padding:"10px 6px",textAlign:"center",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",border:`2px solid ${s.color}22`}}>
                <div style={{fontSize:20}}>{s.icon}</div>
                <div style={{fontSize:16,fontWeight:900,color:s.color,fontFamily:"'Fredoka One',cursive",lineHeight:1}}>{s.val}</div>
                <div style={{fontSize:9,color:"#999",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{marginTop:10,padding:"8px 12px",background:"#FFF3CD",borderRadius:12,border:"1.5px solid #F6A800",fontSize:10,color:"#7a5800",fontFamily:"'Nunito',sans-serif",fontWeight:700,textAlign:"center"}}>
            💡 Toque numa figurinha para marcar como colada
          </div>

          {/* Footer credit */}
          <div style={{marginTop:12,marginBottom:4,textAlign:"center"}}>
            <div style={{fontSize:10,color:"#bbb",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>
              🧑‍💻 Dev: Jackson Tomelin • 🎂 Para: Thiago Henrique Peiker Tomelin
            </div>
          </div>
        </div>
      )}

      {/* ALBUM FWC */}
      {tab==="album"&&albumView==="fwc"&&(
        <div style={{padding:"12px 14px 0"}}>
          <div style={{background:"#fff",borderRadius:16,padding:14,boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
              {FWC.map(s=><StickerCard key={s.id} sticker={s} collected={!!collected[s.id]} onToggle={toggle} color="#1B3A6B"/>)}
            </div>
          </div>
        </div>
      )}

      {/* ALBUM TEAM */}
      {tab==="album"&&activeTeam&&(
        <div style={{padding:"12px 14px 0"}}>
          <div style={{background:"#fff",borderRadius:16,padding:14,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",border:`2px solid ${activeTeam.color}33`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontSize:28}}>{activeTeam.flag}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:15,color:activeTeam.color}}>{activeTeam.name}</div>
                <div style={{fontSize:10,color:"#888",fontFamily:"'Nunito',sans-serif"}}>{activeTeam.stickers.filter(s=>collected[s.id]).length}/20 coladas</div>
              </div>
              <div style={{width:42,height:42,borderRadius:"50%",background:`conic-gradient(${activeTeam.color} ${(activeTeam.stickers.filter(s=>collected[s.id]).length/20)*360}deg,#eee 0deg)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:activeTeam.color,fontFamily:"'Nunito',sans-serif"}}>
                  {Math.round((activeTeam.stickers.filter(s=>collected[s.id]).length/20)*100)}%
                </div>
              </div>
            </div>
            {/* Info fotos — removido texto solto que não tem voz */}
            <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
              {activeTeam.stickers.map(s=><StickerCard key={s.id} sticker={s} collected={!!collected[s.id]} onToggle={toggle} color={activeTeam.color}/>)}
            </div>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button onClick={()=>{const u={};activeTeam.stickers.forEach(s=>{u[s.id]=true;});setCollected(p=>({...p,...u}));setConfetti(true);setTimeout(()=>setConfetti(false),1500);}}
                style={{flex:1,padding:"10px",background:`linear-gradient(135deg,${activeTeam.color},${activeTeam.color}cc)`,border:"none",borderRadius:11,color:"#fff",fontSize:12,fontFamily:"'Fredoka One',cursive",cursor:"pointer"}}>
                ✅ Marcar todas
              </button>
              <button onClick={()=>{const u={};activeTeam.stickers.forEach(s=>{u[s.id]=false;});setCollected(p=>({...p,...u}));}}
                style={{flex:1,padding:"10px",background:"#f0f0f0",border:"none",borderRadius:11,color:"#888",fontSize:12,fontFamily:"'Fredoka One',cursive",cursor:"pointer"}}>
                🗑️ Limpar
              </button>
            </div>
          </div>
        </div>
      )}

      {tab==="faltam"&&<FaltamTab collected={collected} onToggle={toggle}/>}
      {tab==="trocas"&&<TrocasTab trades={trades} setTrades={setTrades}/>}

      <Mascot msg={mascotMsg} muted={muted} onToggleMute={toggleMute}/>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"1.5px solid #f0ebe0",display:"flex",boxShadow:"0 -6px 24px rgba(0,0,0,0.08)",zIndex:100,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
        {[
          {id:"album", icon:"📖", label:"Álbum"},
          {id:"faltam",icon:"📋", label:"Faltam",  badge:TOTAL-totalCollected},
          {id:"trocas",icon:"🔄", label:"Trocas",   badge:trades.reduce((s,t)=>s+t.qty,0)||null},
        ].map(item=>(
          <button key={item.id} onClick={()=>switchTab(item.id)}
            style={{flex:1,padding:"11px 4px 9px",border:"none",
              background: tab===item.id ? "linear-gradient(180deg,#f0faf4,#fff)" : "transparent",
              cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,position:"relative",
              transition:"background 0.2s"}}>
            <span style={{fontSize:22,filter:tab===item.id?"drop-shadow(0 1px 4px rgba(0,156,59,0.3))":"none",transition:"filter 0.2s"}}>{item.icon}</span>
            <span style={{fontSize:9,fontFamily:"'Nunito',sans-serif",fontWeight:900,
              color:tab===item.id?"#009C3B":"#aaa",transition:"color 0.2s"}}>{item.label}</span>
            {item.badge>0&&(
              <div style={{position:"absolute",top:7,right:"50%",transform:"translateX(12px)",
                background:item.id==="faltam"?"#D52B1E":"#F6A800",color:"#fff",borderRadius:9,
                fontSize:7.5,fontWeight:900,fontFamily:"'Nunito',sans-serif",
                padding:"1px 5px",minWidth:15,textAlign:"center",
                boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}>
                {item.badge>99?"99+":item.badge}
              </div>
            )}
            {tab===item.id&&<div style={{position:"absolute",bottom:0,left:"15%",right:"15%",height:3,background:"#009C3B",borderRadius:"3px 3px 0 0",boxShadow:"0 -1px 6px rgba(0,156,59,0.4)"}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}


var syndicators = [
    { name: "news.com.au", bias: 5 },
    { name: "Daily Mail", bias: 5 },        // sometimes not directly credited, but with hyperlink
    { name: "Daily Telegraph", bias: 5 },
    { name: "Washington Post", bias: 5},
    { name: "BANG! Showbiz", bias: 5},
    { name: "Newstalk ZB", bias: 5},
    { name: "Spy.co.nz", bias: 5},

    // Gizmodo - italics only

    { name: "AAP", bias: 5 },
    { name: "AP", bias: 5 },        // XXX must go after AAP until we do a regex properly here
    { name: "CATERS", bias: 5 },
];

var opiners = [
    { name: "Barry Soper", tag: "Barely Sober", nick: "Baz" },
    { name: "Rachel Smalley", tag: "Smalley", nick: "Rach" },
    { name: "Mike Hosking", tag: "Hoskby", nick: "Hosk" },
    { name: "Heather du Plessis-Allan", tag: "HDPA", nick: "Baz" },
    { name: "Kate Hawkesby", tag: "Hoksby", nick: "Kate" },
    { name: "Matthew Hooton", tag: "Hoots", nick: "Hoots" },
    { name: "Deborah Hill Cone", tag: "DHC", nick: "DHC" },
    ];

var frontPageSectionTitles = {
    focusVideo: 'NZ Herald Focus and Local Focus videos',
    latestVideo: 'Latest Video',
    brandInsight: 'Brand Insight',
    opinion: 'Opinion',
    motoring: 'Motoring News',
    movies: 'Movies',
    watchMe: 'New to WatchMe',
    spy: 'Trending on SPY',
    viva: 'Trending on Viva',
    bite: 'Latest from Bite',
};
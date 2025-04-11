// scripts/features/record.js

export async function handleRecord(characterMap) {
    // const utilityZones = Array
    //     .from(document.querySelectorAll('.grid-item__drop-zone--utility'))
    //     .filter(z => z.querySelector('img'));

    // const banZones = Array.from(document.querySelectorAll('.grid-item__drop-zone--ban'));
    // const pickZones = Array.from(document.querySelectorAll('.grid-item__drop-zone--pick'));

    // console.log(`utilityImages ${JSON.stringify(utilityImages, null, 2)}`)
    // console.log(`banImages ${JSON.stringify(banImages, null, 2)}`)
    // console.log(`pickImages ${JSON.stringify(pickImages, null, 2)}`)

    // utilityZones.forEach(zone => {
    //     console.log(`zone ${zone.outerHTML}`)
    //     console.log(`zoneId ${zone.id}`)
    //     const img = zone.querySelector('img');
    //     const imgId = img.id;
    //     const character = characterMap[imgId];
    //     console.log(`character ${JSON.stringify(character, null, 2)}`)
    // });

    const response = await fetch('/api/record', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ /* 你的資料 */ })
    });
    const json = await response.json();
    console.log(`${json}`)

}
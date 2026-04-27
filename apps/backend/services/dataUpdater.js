import { db, FieldValue } from "../infra/firebase.js";

export const patchUpdateData = async ({collection, patchField, patchData}) => {
    const snapshot = await db.collection(collection).get();

    let batch = db.batch();
    let opCount = 0;
    let total = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();

        if (data[patchField] === undefined) {
            batch.update(doc.ref, { [patchField]: patchData });
            opCount++;
            total++;
            if (opCount === 500) {
                await batch.commit();
                batch = db.batch();
                opCount = 0;
            }
        }
    }

    if (opCount) await batch.commit();
    console.log(`${total} operações realizadas.`)
}
export const deleteFieldsFromCollection = async ({collection, fieldsToDelete}) => {
    const snapshot = await db.collection(collection).get();

    let batch = db.batch();
    let opCount = 0;
    let total = 0;

    for (const doc of snapshot.docs) {
        const updateData = {};
        const docData = doc.data();
        for (const field of fieldsToDelete) {
            if (docData[field] !== undefined) {
                updateData[field] = FieldValue.delete();
            }
        }
        if (Object.keys(updateData).length > 0) {
            batch.update(doc.ref, updateData);
            opCount++;
            total++;
        }
        if (opCount === 500) {
            await batch.commit();
            batch = db.batch();
            opCount = 0;
        }
    }

    if (opCount) await batch.commit();
    console.log(`${total} operações realizadas.`)
}


//deleteFieldsFromCollection({collection: "plantas", fieldsToDelete: ["ciclo"]})
//patchUpdateData({collection: "plantas", patchField: "editavelNoMapa", patchData: true})
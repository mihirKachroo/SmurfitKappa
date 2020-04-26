const { admin, db } = require('../util/admin');

const config = require('../util/config');
const { uuid } = require("uuidv4");

const firebase = require("firebase");
firebase.initializeApp(config);

const signup = (req, res) => {
    const newStore = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        storeName: req.body.storeName,
    }
    console.log('New store object created');

    //TODO: validate data
    let token, storeId;
    db.doc(`stores/${newStore.storeName}`).get()
        .then(doc => {
            console.log('In the first then')
            if (doc.exists) {
                return res.status(400).json({ storeName: `The store name ${newStore.storeName} is already taken` })
            } else {
                console.log('Creating new user')
                return firebase.auth()
                    .createUserWithEmailAndPassword(newStore.email, newStore.password)
            }
        })
        .then(data => {
            console.log('Just created the user')
            storeId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            const storeCredentials = {
                storeName: newStore.storeName,
                email: newStore.email,
                createdAt: new Date().toISOString(),
                token
            };

            return db.doc(`/stores/${newStore.storeName}`).set(storeCredentials);            
        })
        .then(() => {
            return res.status(201).json({ token })
        })
        .catch(err => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return res.status(400).json( {email: 'Email is already in use '})
            } else {
                return res.status(500).json({ error: err.code });
            }
        })

}

const uploadImage = (req, res) => {
    const BusBoy = require("busboy");
    const path = require("path");
    const os = require("os");
    const fs = require("fs");

    const busboy = new BusBoy({ headers: req.headers });

    let imageToBeUploaded = {};
    let imageFileName;
    // String for image token
    let generatedToken = uuid();

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
        console.log(fieldname, file, filename, encoding, mimetype);
        if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
            return res.status(400).json({ error: "Wrong file type submitted" });
        }
        // my.image.png => ['my', 'image', 'png']
        const imageExtension = filename.split(".")[filename.split(".").length - 1];
        // 32756238461724837.png
        imageFileName = `${Math.round(
            Math.random() * 1000000000000
        ).toString()}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on("finish", () => {
        admin
            .storage()
            .bucket()
            .upload(imageToBeUploaded.filepath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype,
                        //Generate token to be appended to imageUrl
                        firebaseStorageDownloadTokens: generatedToken,
                    },
                },
            })
            .then(() => {
                // Append token to url
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media&token=${generatedToken}`; //Maybe take out &token=${generatedToken}
                return db.doc(`/stores/${req.store.storeName}`).update({ imageUrl });
            })
            .then(() => {
                return res.json({ message: "image uploaded successfully" });
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ error: "something went wrong" });
            });
    });
    busboy.end(req.rawBody);
}

module.exports = { signup, uploadImage };
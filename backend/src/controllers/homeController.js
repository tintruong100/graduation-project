// import db from "../models/index.js";
// import CRUDService from "../services/CRUDService.js";

let getHomePage = (req, res) => {
    return res.render("homepage.ejs");
}

// let getHomePage = async (req, res) => {
//     try {
//         let data = await db.User.findAll();
//         return res.render("homepage.ejs", {
//             data: JSON.stringify(data)
//         });
//     } catch (error) {
//         console.log(error);
//     }
// }

// let getAboutPage = (req, res) => {
//     return res.render("test/about.ejs");
// }

// let getCRUD = (req, res) => {
//     return res.render("crud.ejs");
// }

// let postCRUD = async (rep, res) => {
//     await CRUDService.createNewUser(rep.body);
//     return res.redirect('/get-crud');
// }

// let displayGetCRUD = async (req, res) => {
//     let data = await CRUDService.getAllUsers();
//     return res.render("display-crud.ejs", {
//         dataTable: data
//     });
// }

// let getEditCRUD = async (req, res) => {
//     let userId = req.query.id;
//     if (userId) {
//         let userData = await CRUDService.getUserById(userId);

//         return res.render("edit-crud.ejs", {
//             user: userData
//         });
//     } else {
//         return res.send('User not found');
//     }
// }

// let putCRUD = async (req, res) => {
//     let data = req.body;
//     await CRUDService.updateUserData(data);
//     return res.redirect('/get-crud');
// }

// let deleteCRUD = async (req, res) => {
//     let userId = req.query.id;
//     await CRUDService.deleteUserById(userId);
//     return res.redirect('/get-crud');
// }

export default {
    getHomePage: getHomePage,
    // getAboutPage: getAboutPage,
    // getCRUD: getCRUD,
    // postCRUD: postCRUD,
    // displayGetCRUD: displayGetCRUD,
    // getEditCRUD: getEditCRUD,
    // putCRUD: putCRUD,
    // deleteCRUD: deleteCRUD,
}
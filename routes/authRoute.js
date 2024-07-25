const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
    router.post('/sign-up', authController.createAccount);
} else{
    router.post('/sign-up', (req, res)=> {
        res.status(403).send('Signup is disabled in production mode');
    });
}
router.post('/sign-in', authController.createLongin);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);
router.get('/profile', authController.getCurrentUser);
router.get('/users', authController.getAllUsers);
router.get('/verifyToken', authController.verifyToken);
router.get('/user/:id', authController.getUserById);
router.patch('/update-user', authController.updateCurrentUser);
router.delete('/delete-account', authController.deleteAccount);


module.exports = router;

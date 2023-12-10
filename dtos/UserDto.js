module.exports = class UserDto {
    id;
    login;
    rating;
    role;
    fullname;
    profileImage;
    email;
    emailConfirmed;


    constructor(model) {
        this.id = model.id;
        this.login = model.login;
        this.email = model.email;
        this.rating = model.rating;
        this.fullname = model.fullname;
        this.role = model.role;
        this.profileImage = model.profile_image;
        this.emailConfirmed = model.email_confirmed;
    }
}
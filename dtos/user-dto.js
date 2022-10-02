module.exports = class UserDto {
    email;
    id;
    isActivated;
    balance;
    status;

    constructor(model) {
        this.email = model.email;
        this.id = model._id;
        this.isActivated = model.isActivated;
        this.balance = model.balance;
        this.status = model.status
        
    }
}



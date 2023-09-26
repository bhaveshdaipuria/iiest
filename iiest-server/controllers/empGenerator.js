function generate_username(name, employeeCount){
    const sanitizedName = name.replace(/\s/g, '').toLowerCase();
    return `${sanitizedName}_iiest_${employeeCount}`;
}

function generate_password(length){
    let charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }
      
    return password;
}

function generate_employee_id (companyName, employeeCount){
    let employeeId = ''
    if(companyName === 'Federation'){
        employeeId = `IIEST/FD/${employeeCount}`;
    }else if(companyName === 'Business Center'){
        employeeId = `IIEST/BC/${employeeCount}`;
    }
    return employeeId;
}

module.exports = { generate_username, generate_password, generate_employee_id }
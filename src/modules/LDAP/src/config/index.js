import dotenv from 'dotenv';
dotenv.config();

export default {
    ldap: {
        ad1: process.env.LDAP_AD1,
        ad2: process.env.LDAP_AD2 || null,

    }
}
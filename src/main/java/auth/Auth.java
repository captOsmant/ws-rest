package auth;

import utils.Console;
import utils.DBConnection;

import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Created by CaptainOsmant on 12.01.2017.
 */
public class Auth {
    public static int ROLE_MODERATOR = 1;
    public static int ROLE_ADMINISTRATOR = 2;
    public static int ROLE_UNAUTHORIZED = 0;

    public static String md5(String val){
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            md.reset();
            md.update(val.getBytes());
            String s = new BigInteger(1,md.digest()).toString(16);

            return s;

        }catch(NoSuchAlgorithmException ex){
            System.out.println(ex.getMessage());
            return "";
        }
    }

    public static int roleForToken(String token){
        DBConnection con = new DBConnection();
        ResultSet result = con.execSelect("SELECT * FROM users WHERE token='"+token+"' AND role>="+ROLE_MODERATOR);

        try{
            result.next();
            String role = result.getString(5);
            String login = result.getString(2);


            return Integer.valueOf(role);

        }catch(SQLException e){
            System.out.println(e.getMessage());
            return ROLE_UNAUTHORIZED;

        }
    }

    public static boolean allowedModerate(String token){
        return (roleForToken(token)>=ROLE_MODERATOR);
    }

    public static boolean allowedAdministrate(String token){

        return(roleForToken(token)>=ROLE_ADMINISTRATOR);
    }
}

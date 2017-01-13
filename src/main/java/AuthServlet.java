import auth.Auth;
import utils.DBConnection;

import javax.servlet.Servlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.UnsupportedEncodingException;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Created by CaptainOsmant on 12.01.2017.
 */
public class AuthServlet extends HttpServlet implements Servlet{

    public AuthServlet(){
        super();
    }

    @Override
    protected void doHead(HttpServletRequest req, HttpServletResponse res){
        try{
            req.setCharacterEncoding("UTF-8");

            String token_param = req.getParameter("token");

            if(token_param!=null){
                System.out.println(token_param);

                DBConnection con = new DBConnection();
                ResultSet result = con.execSelect("SELECT * FROM users WHERE token='"+token_param+"'");

                try{
                    result.next();
                    String role = result.getString(5);
                    String login = result.getString(2);

                    res.setHeader("X-Role",role);
                    res.setHeader("X-Username", login);
                    return;

                }catch(SQLException e){
                    System.out.println(e.getMessage());
                    res.setHeader("X-Role","0");
                    return;
                }
            }

            String login = req.getParameter("login");
            String password = req.getParameter("password");



            password = Auth.md5(password);

            DBConnection con = new DBConnection();
            ResultSet result = con.execSelect("SELECT * FROM users WHERE login='" + login + "' AND password='" + password + "' ");


            try {
                result.next();
                String id = result.getString(1);
                String role = result.getString(5);

                String token = role+String.valueOf(System.currentTimeMillis())+id;
                token = Auth.md5(token);

                con.execUpdate("UPDATE users SET token='"+token+"' WHERE id="+id);

                res.setHeader("X-Auth-Token",token);
                res.setHeader("X-Role", role);
                res.setHeader("X-Username",result.getString(2));

            }catch(SQLException e){
                //System.out.println(e.getMessage());
                // No user found
                res.setHeader("X-Access-Token","");
                res.setHeader("X-Role", String.valueOf(Auth.ROLE_UNAUTHORIZED));
            }

        }catch (UnsupportedEncodingException e){
            System.out.println(e.getMessage());
            return;
        }

    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res){
        String token = req.getParameter("token");
        res.setHeader("Allow", token );
    }
}

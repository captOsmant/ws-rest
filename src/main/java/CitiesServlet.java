import utils.DBConnection;

import javax.servlet.Servlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Created by CaptainOsmant on 12.01.2017.
 */
public class CitiesServlet  extends HttpServlet implements Servlet {

    public CitiesServlet(){
        super();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response){
        DBConnection con = new DBConnection();

        try {
            ResultSet set = con.execSelect("SELECT * FROM cities");
            response.setContentType("application/json; Charset=utf-8");
            PrintWriter writer = response.getWriter();
            String res = "";

            set.next();
            do{
                String desc= set.getString(8).replaceAll("[\n]+","");
                res+= "{\"id\":\""+set.getInt(1)+"\"," +
                        "\"name\":\""+set.getString(2)+"\"," +
                        "\"ru_name\":\""+set.getString(3)+"\"," +
                        "\"lat\":\""+set.getFloat(4)+"\"," +
                        "\"lon\":\""+set.getFloat(5)+"\"," +
                        "\"population\":\""+set.getInt(6)+"\"," +
                        "\"country_id\":\""+set.getInt(7)+"\"," +
                        "\"description\":\""+desc+"\"" +
                        "}";
                if(!set.isLast()){
                    res+=",";
                }

            }while(set.next());

            writer.write("[");
            writer.write(res);
            writer.write("]");
            writer.close();

        }catch(SQLException e){
            response.setContentType("text/plain");
            try{
            PrintWriter writer = response.getWriter();
                writer.write(e.getMessage());
                writer.close();
            }catch(IOException ex){
                System.out.println(ex.getMessage());
            }
            return;
        }catch(IOException e){
            System.out.println(e.getMessage());
        }
    }
}

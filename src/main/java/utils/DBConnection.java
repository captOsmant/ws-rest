package utils; /**
 * Created by CaptainOsmant on 11.01.2017.
 */
import java.net.URL;
import java.net.URLClassLoader;
import java.sql.*;
import javax.naming.*;
import javax.sql.*;
import javax.swing.plaf.nimbus.State;

import com.mysql.fabric.jdbc.FabricMySQLDriver;
import com.mysql.jdbc.Driver;


public class DBConnection {

    private static final String URL="jdbc:mysql://localhost:3306/javadb?useUnicode=true&characterEncoding=UTF-8";
    private static final String USERNAME = "admin";
    private static final String PASSWORD = "password";

    private Connection connection;

    public DBConnection(){

        try {
            Class.forName("com.mysql.jdbc.Driver");
        }catch(Exception e){
            System.out.println("Error: "+e);
            return;
        }

        try {
            //Driver driver = new FabricMySQLDriver();
            DriverManager.registerDriver(new FabricMySQLDriver());
            this.connection = DriverManager.getConnection(URL, USERNAME, PASSWORD);
            //this.execUpdate("USE world");

        }catch(SQLException e){
            System.out.println("Error: "+e.getMessage());
            return;
        }



    }

    public Connection getConnection(){
        return this.connection;
    }

    public ResultSet execSelect(String query) {
        try {
            Statement st = this.connection.createStatement();
            ResultSet result = st.executeQuery(query);
            return result;
        }catch (SQLException ex){
            System.out.println(ex.getMessage());
        }
        return null;
        //st.close();

    }

    public boolean execUpdate(String query){
        try {
            Statement st = this.connection.createStatement();
            st.executeQuery("SET NAMES 'UTF8'");
            st.executeQuery("SET CHARACTER SET 'UTF8'");

            st.executeUpdate(query);
            st.close();
            return true;
        }catch(SQLException e){
            Console.log(e.getMessage());
        }

        return false;
    }



}

<%--
  Created by IntelliJ IDEA.
  User: CaptainOsmant
  Date: 27.11.2015
  Time: 22:19
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
  <head>
    <title>My First Web Application</title>
    <meta charset="utf-8"/>
    <link rel="stylesheet" href="/Unrequired/css/main.css">
    <script src=""></script>
  </head>

  <body>
    <frameset>
      <iframe src="frames/header.html" width="1000" height="50" name="menu"/>

      </iframe>

      <iframe src="frames/content.html" width="1000" height="400" name="main">

      </iframe>

      <iframe src="frames/footer.html" width="1000"  name="footer">


      </iframe>
    </frameset>
  </body>
</html>

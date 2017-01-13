<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:template match="/">
        <html>
            <head>
                <title> </title>
                <link rel="stylesheet" href="/css/main.css"/>
                <link rel="stylesheet" href="/css/service.css"/>

            </head>


            <body>
                <ol>
                    <xsl:for-each select="services/service">
                        <li>
                            <figure>
                                <img src=""> <xsl:attribute name="src"><xsl:value-of select="img"/></xsl:attribute></img>
                            </figure>
                            <figcaption>
                                <h3><xsl:value-of select="title"/></h3>
                                <p><xsl:value-of select="price"/></p>
                            </figcaption>

                        </li>
                    </xsl:for-each>
                </ol>
            </body>
        </html>

    </xsl:template>

</xsl:stylesheet>
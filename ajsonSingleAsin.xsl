<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:aws="http://webservices.amazon.com/AWSECommerceService/2005-10-05" exclude-result-prefixes="aws">

	<xsl:output method="text"/>

<!-- +- -->
<!-- http://www.kokogiak.com/gedankengang/2006/05/consuming-amazons-web-api-directly.html -->
<!--         http://xml-us.amznxslt.com/onca/xml?Service=AWSECommerceService&SubscriptionId=19267494ZR5A8E2CGPR2&AssociateTag=antrixnet-20&IdType=ASIN&ItemId=1400066425&Operation=ItemLookup&ResponseGroup=Images&Style=http://antrix.net/dumble/ajsonSingleAsin.xsl&ContentType=text/javascript&CallBack=amzJSONCallback 
-->
<!-- | Base Template Match, General JSON Format -->
<!-- +- -->
	<xsl:template match="/">
		<xsl:value-of select="aws:ItemLookupResponse/aws:OperationRequest/aws:Arguments/aws:Argument[@Name = 'CallBack']/@Value" /><xsl:text>( { "Item" : </xsl:text><xsl:apply-templates/><xsl:text> } ) </xsl:text>
	</xsl:template>
	
	<xsl:template match="aws:RequestId"></xsl:template>
	<xsl:template match="aws:RequestProcessingTime"></xsl:template>
	<xsl:template match="aws:Items">
		<xsl:apply-templates select="aws:Item"/>
	</xsl:template>
	
<!-- +- -->
<!-- | Fetch ASIN, URL, Title, Price, Description -->
<!-- +- -->	
	<xsl:template match="aws:Item">
		<xsl:text> {</xsl:text>
		<xsl:text>"asin":"</xsl:text><xsl:value-of select="aws:ASIN"/><xsl:text>",</xsl:text>
		<xsl:text>"largeimgurl":"</xsl:text><xsl:value-of select="aws:LargeImage/aws:URL"/><xsl:text>",</xsl:text>
		<xsl:text>"thumbdims":["</xsl:text><xsl:value-of select="aws:LargeImage/aws:Height"/><xsl:text>","</xsl:text><xsl:value-of select="aws:LargeImage/aws:Width"/><xsl:text>"]</xsl:text>
		<xsl:text>} </xsl:text>
	</xsl:template>
</xsl:stylesheet>






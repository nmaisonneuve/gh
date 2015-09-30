(raw) scraping of linkedin url of companies

- input: csv with column {company name}
- output: csv with column {input company name, title of the company name from linkedin website, linkedin url}


# requirement

phantomjs

# usage
$> phantomjs scrape_company_linkedin.js company_name.csv (as input) company_linkedin.csv  (as ouput)

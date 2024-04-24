#!/usr/bin/python3

import copy
import glob
import markdown
import bs4
from bs4 import BeautifulSoup

with open("search-template.html", "r") as file:
    search_template_soup = BeautifulSoup(file, "html.parser")
with open("layout-template.html", "r") as file:
    layout_template_soup = BeautifulSoup(file, "html.parser")

with open("properties.md", "r") as file:
    text = file.read()
    md = markdown.Markdown(extensions = ['meta'])
    md.convert(text)
    properties = md.Meta

with open("styles/properties.css", "w") as file:
    file.write(":root {\n")
    for property, value in properties.items():
        value = value[0].replace("'", "")
        value = value.replace('"', "")
        file.write(f"{property}: {value};\n")
    file.write("}")

md_htmls = []
md_metas = []
nav_soups = []
for path in glob.iglob("markdown/*.md"):
    with open(path, "r") as file:
        text = file.read()
        md = markdown.Markdown(extensions = ['meta'])
        md_htmls.append(md.convert(text))
        md_metas.append(md.Meta)

snake_titles = [meta['title'][0].lower().replace(" ", "-") for meta in md_metas]
for snake_title, meta in zip(snake_titles, md_metas):
    nav_soups.append(BeautifulSoup(f"<a href={snake_title}.html>{meta['title'][0]}</a>", "html.parser"))

with open("index.html", "r+") as file:
    soup = BeautifulSoup(file, "html.parser")
    redirect = soup.css.select("meta[http-equiv]")
    redirect[0]["content"] = f"0; url={snake_titles[0]}.html"

    file.seek(0)
    file.truncate(0)
    file.write(soup.prettify())    

for title, md_html, meta in zip(snake_titles, md_htmls, md_metas):
    soup = copy.copy(layout_template_soup)
    md_soup = BeautifulSoup(md_html, "html.parser")    

    comments = soup.find_all(string=lambda text: type(text) == bs4.element.Comment)
    for comment in comments:
        comment_string = comment.string.strip()
        parent = comment.parent

        if comment_string == "Navigation Links":
            parent.clear()            
            for nav_soup in nav_soups:
                nav_soup = copy.copy(nav_soup)
                if nav_soup.string.strip() == meta["title"][0]:
                    nav_soup.a["id"] = "current-page"
                parent.append(nav_soup)

        if comment_string == "Title":
            parent.clear()
            parent.append(f"{meta['title'][0]}")

        elif comment_string == "Markdown Content":
            parent.clear()            
            parent.append(md_soup)
        
        elif comment_string == "Search Location" and meta["page-type"][0] == "search":
            parent.append(copy.copy(search_template_soup))
    
    if meta["page-type"][0] == "search":
        for key, value in meta.items():
            input_soup = soup.css.select(f"input[name={key}]")
            if len(input_soup) > 0:
                input_soup = input_soup[0]

                set_value = value[0]
                if "list" in input_soup.attrs.keys():
                    list_attribute = input_soup["list"]
                    data_list_soup = soup.find("datalist", id=list_attribute)
                    option_soup = data_list_soup.css.select(f"option[value~={set_value} i]")
                    if len(option_soup) > 0:
                        set_value = option_soup[0]["data-value"]

                input_soup["value"] = set_value
                input_soup["type"] = "hidden"
                input_soup["class"] = []
                label_soup = soup.css.select(f"label[for={input_soup['id']}]")[0]
                label_soup["hidden"] = "hidden"

    with open(f"{title}.html", "w") as file:
        file.write(soup.prettify())
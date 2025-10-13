
# -- Project information -----------------------------------------------------

project = 'ska-oso-pht-ui'
copyright = '2023, SKAO'
author = 'SKAO, Stargazer'

# The short X.Y version
version = '7.0.0'
# The full version, including alpha/beta/rc tags
release = '7.0.0'

# -- General configuration ---------------------------------------------------

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.doctest',
    'sphinx.ext.intersphinx',
    'sphinx.ext.todo',
    'sphinx.ext.coverage',
    'sphinx.ext.mathjax',
    'sphinx.ext.ifconfig',
    'sphinx.ext.viewcode',
    'sphinx.ext.githubpages',
    "recommonmark"
]

templates_path = []

source_suffix = ['.rst', '.md']

master_doc = 'index'

exclude_patterns = []

pygments_style = 'sphinx'

# -- Options for HTML output -------------------------------------------------



html_context = {}

html_static_path = []


# -- Options for HTMLHelp output ---------------------------------------------

htmlhelp_basename = 'ska-oso-pht-ui'

# -- Options for LaTeX output ------------------------------------------------

latex_elements = {
}

latex_documents = [
    (master_doc, 'ska-oso-pht-ui.tex', 'ska-oso-pht-ui Documentation',
     'SKAO, (Stargazer)', 'manual'),
]

# -- Options for manual page output ------------------------------------------

man_pages = [
    (master_doc, 'ska-oso-pht-ui', 'ska-oso-pht-ui Documentation',
     [author], 1)
]

# -- Options for Texinfo output ----------------------------------------------

texinfo_documents = [
    (master_doc, 'ska-oso-pht-ui', 'ska-oso-pht-ui Documentation',
     author, 'ska-oso-pht-ui', 'SKA Portal',
     'Miscellaneous'),
]

# -- Options for Epub output -------------------------------------------------

epub_title = project

epub_exclude_files = ['search.html']

# -- Extension configuration -------------------------------------------------

# -- Options for intersphinx extension ---------------------------------------

intersphinx_mapping = {}

# -- Options for todo extension ----------------------------------------------

todo_include_todos = True

html_theme = 'ska_ser_sphinx_theme'
numfig = True

numfig_format={
    'figure': 'Figure %s :',
    'table': 'Table %s',
    'code-block': 'Listing %s'
}

# -- Project information -----------------------------------------------------

project = 'ska-oso-pht-ui'
copyright = '2023, SKAO'
author = 'SKAO, (Trevor A Swain)'

# The short X.Y version
version = '0.1.1'
# The full version, including alpha/beta/rc tags
release = '0.1.1'

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
]

templates_path = []

source_suffix = '.rst'

master_doc = 'index'

exclude_patterns = []

pygments_style = 'sphinx'

# -- Options for HTML output -------------------------------------------------

html_theme = 'ska_ser_sphinx_theme'

html_context = {}

html_static_path = []

# -- Options for HTMLHelp output ---------------------------------------------

htmlhelp_basename = 'ska-oso-pht-ui'

# -- Options for LaTeX output ------------------------------------------------

latex_elements = {
}

latex_documents = [
    (master_doc, 'ska-oso-pht-ui.tex', 'ska-oso-pht-ui Documentation',
     'SKAO, (Trevor A Swain)', 'manual'),
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
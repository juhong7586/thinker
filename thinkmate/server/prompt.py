import re, random

def build_prompt_from_answers(answers: dict) -> str:
    txt = str(answers).lower()
    lvls = ["Self","Family","Friends","Class","School","Community","City","Country","World"]
    kw = {"Friends":["friend","peer"],"Class":["class","team"],"School":["school"],"Community":["community","local"],"Family":["family","home"],"Self":["myself","me"],"City":["city"],"Country":["country"],"World":["world"]}
    sc = {l: sum(txt.count(k) for k in kw.get(l,[])) for l in lvls}
    top = sorted(lvls,key=lambda l:-sc[l])[:2] or ["Class","Friends"]
    focus = next((w for w in ["recycling","confidence","kindness"] if w in txt),"growth")
     # Strongly request an exact, machine-parseable format to reduce variation.
    # We ask the model to respond EXACTLY like the template below (no extra prose):
    template = (
        "RESPOND EXACTLY IN THIS FORMAT (NO EXTRA TEXT):\n"
        "1. options: {opt0} {opt1}\n"
        "2. You seek change at {opt0} and {opt1} levels, focusing on {focus}.\n"
        "3. Let's do: \n"
        "4. suggestion:\n"
        "- {opt0}: \n"
        "- {opt1}: \n"
    )


    return (
        f"User survey answers (JSON):\n{answers}\n\n"
        "Analyze the user's desired social impact level. The user is 11–15 years old in 2025. Use the following template. For number 3, suggest what the student could start to do with the desired social level. For number 4, suggest 3 topics they can explore further per each social impact level.\n"
        + template.format(opt0=top[0], opt1=top[1], focus=focus)
    )

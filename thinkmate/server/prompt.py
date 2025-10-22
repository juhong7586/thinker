import re, random

def build_prompt_from_answers(answers: dict) -> str:
    txt = str(answers).lower()
    lvls = ["Self","Family","Friends","Class","School","Community","City","Country","World"]
    kw = {"Friends":["friend","peer"],"Class":["class","team"],"School":["school"],"Community":["community","local"],"Family":["family","home"],"Self":["myself","me"],"City":["city"],"Country":["country"],"World":["world"]}
    sc = {l: sum(txt.count(k) for k in kw.get(l,[])) for l in lvls}
    top = sorted(lvls,key=lambda l:-sc[l])[:2] or ["Class","Friends"]
    focus = next((w for w in ["recycling","confidence","kindness"] if w in txt),"growth")
    tbank = {"Friends":["Kindness","Study Buddies","Game Club"],"Class":["Team Spirit","Idea Board","Peer Mentoring"],"School":["Recycling","Buddy System","Club Fair"],"Community":["Park Cleanup","Food Drive","Repair Cafe"],"Family":["Meal Plan","Chore Swap","Family Reading"],"Self":["Mindfulness","Goal Setting","Time Mgmt"],"City":["Street Mural","Tree Map","Water Test"],"Country":["Civics","STEM Fair","History"],"World":["UN Goals","Ocean Care","Pen Pals"]}
    topics = "\n".join(f"- {l}: {tbank[l]}" for l in top)
    # Strongly request an exact, machine-parseable format to reduce variation.
    # We ask the model to respond EXACTLY like the template below (no extra prose):
    template = (
        "RESPOND EXACTLY IN THIS FORMAT (NO EXTRA TEXT):\n"
        "1. options: {opt0}, {opt1}\n"
        "2. task: The student seeks change at {opt0} and {opt1} levels, focusing on {focus}. Their aims are concrete and near-term.\n"
        "3. task: What is one step you could start this week for {opt0} or {opt1}?\n"
        "4. suggest 3 topics they can explore further per each social impact level:\n"
        "- {opt0}: {topics0}\n"
        "- {opt1}: {topics1}\n"
    )

    topics0 = repr(tbank.get(top[0], []) )
    topics1 = repr(tbank.get(top[1], []) )

    return (
        f"User survey answers (JSON):\n{answers}\n\n"
        "Analyze the user's desired social impact level. The user is 11–15 years old in 2025.\n"
        + template.format(opt0=top[0], opt1=top[1], focus=focus, topics0=topics0, topics1=topics1)
    )

##
import pandas as pd
import requests 
from requests.exceptions import HTTPError
import urllib.parse
import json
from bs4 import BeautifulSoup as bs
import os
## dependencies
# pandas
# requests
# bs4
# new
# test

# needs to import KEY from secrets
KEY = os.environ['GOOGLE_KEY']
filepath = './public/data/data.json'
## step 1 : import json file to df
df1 = pd.read_json(filepath)


## step 2 : scrape the first page every day



url = 'https://dev.classmethod.jp/pages/1'
text = requests.get(url).text
# print(text)

soup = bs(text, 'html.parser')

text1 = soup.findAll('div', attrs = {'class': 'post-container'},limit=None)

# 날짜 리스트 (3stage)
prelist1 = [y.findAll('div', attrs = {'class': 'sub-content'})[0] for y in text1]
list1 = [[x.text.replace('.','-') for x in y.findAll('p', attrs = {'class': 'date'})][0] for y in prelist1]


# 제목 리스트 (2 stage)

prelist2 = [y.findAll('div', attrs = {'class': 'post-content'})[0] for y in text1]
list2 = [[x.text.strip() for x in y.findAll('h3', attrs = {'class': 'post-title'})][0] for y in prelist2]


# 점수 리스트
list3 = [[x.text.strip() for x in y.findAll('div', attrs = {'class': 'share'})][0] for y in text1]


# url 리스트
list4 = [[(r'https://dev.classmethod.jp' + x['href']) for x in y.findAll('a')][0] for y in text1]


df2 = pd.DataFrame(
    {'date': list1,
    'title': list2,
    'likes': list3,
    'url':list4})

## add translation to df


def add_trans(df,columnname, api_key, to_lang):
    # target_lang = 'ja', 'ko'
    # get content as list
    # declare variables before list comprehension
    to_lang = to_lang
    api_key = api_key
    contentlist = df[columnname].tolist()

    # translate
    resultlist = [google_translate(api_key,i,to_lang) for i in contentlist]
    # add to df
    df['translated'] = resultlist
    return df


def google_translate(api_key, text_to_translate, to_language):

    params = {'source': 'ja', 'target': to_language, 'key': api_key, 'q': text_to_translate }
    # Edge case where Google doesn't translate correctly if there is a period immediately before \n. Add a space

    url = "https://translation.googleapis.com/language/translate/v2?%s" % (urllib.parse.urlencode(params))
    try:
        response = requests.get(url)
        response.raise_for_status()
    except HTTPError as http_err:
        status_code = http_err.response.status_code
        print("Http Error occurred - Error Status Code : " + status_code)
        exit(1)

    json_data = json.loads(response.text)
    translated_text = json_data['data']['translations'][0]['translatedText']
    translated_text = translated_text.replace('0x0A', '\\n')
    return translated_text


## to save resources, drop common values between df1(orignal data) and df2( new data)
cond = df2['url'].isin(df1['url'])
df2.drop(df2[cond].index, inplace = True)

# add trans from df2

df2 = add_trans(df2,'title',KEY,'en')


## concat original df and new df, also delete dupicates

# 합치기 전 df2의 string -> datetime conversion (왜인지는 하단 설명)
df2['date'] =pd.to_datetime(df2['date'], format='%Y-%m-%d')

# 합치기
finaldf = pd.concat([df1,df2],ignore_index=True)

# 혹시 모르니 drop duplicates 해주기
finaldf = finaldf.drop_duplicates('url')


# ## 최신 날짜가 맨 상단에 뜨게 sort
# finaldf = finaldf.sort_values(by='date',ascending=False)


# 내가 원하는 형식으로 바꿔주기 날짜는 (df loaded from json is datetime, parsed new date is string so string->datetime conversion before is needed)

#git 

finaldf['date'] = finaldf['date'].dt.strftime('%Y-%m-%d')

# finaldf를 다시 저장
finaldf.to_json(filepath, orient='records')

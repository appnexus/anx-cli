# Anx Cli
## Installation

```shell
npm install anx-cli -g
```

## Dev Installation

```shell
git clone git@github.com:appnexus/anx-cli.git
cd <cloned folder>
npm link
```

## Usage
### Set Target

```shell
anx target hb.sand-08.adnxs.net
```

Production: api.appnexus.com<br>Development: hb.sand-08.adnxs.net

### Login

```shell
anx login [optional username]
```

### Generic GET and POST Commands
Requests can be manually constructed using the _get_ and _post_ commands.

#### Example

```shell
anx get "user?id=12"
```

### Users Command

```shell
anx users
```

#### Command Result

```shell
Id Username        First Name      User Type
=============================================
1  tester          tester          bidder
2  albert          albert          admin
3  bill            bill            member
4  bert OmAos8r3vYlWV   member
...

[Records 1 to 25 of 6315] View More? (Y/n)
```

## Command List

```shell
Usage: anx <command> [options]

Commands:

  get [url]              make a GET request to target
  post [url] [payload]   make a POST request to target
  advertiser [advertiser_id] get a single Advertiser record by Id
  advertisers [options]  get a list Advertiser records
  creative [creative_id] get a single Creative record by Id
  creatives [options]    get a list Creative records
  creative-custom-request-template [creative-custom-request-template_id] get a single Creative-custom-request-template record by Id
  creative-custom-request-templates [options]  get a list Creative-custom-request-template records
  member [member_id]     get a single Member record by Id
  members [options]      get a list Member records
  publisher [publisher_id] get a single Publisher record by Id
  publishers [options]   get a list Publisher records
  template [template_id] get a single Template record by Id
  templates [options]    get a list Template records
  user [user_id]         get a single User record by Id
  users [options]        get a list User records
  login [username]       run remote setup commands
  logout                 logout by removing session token
  switch-user [user_id]  switch session user
  target [url]           set target or view current target
  targets                list known targets

Options:

  -h, --help                 output usage information
  -V, --version              output the version number
  -s, --pagesize [pagesize]  page size (default 25)
  -t, --trace                print all http requests
  -j, --json                 print as json
  -f, --file <file>          post a file
  -m, --meta                 get meta data
```

## Session
User targets and session tokens are kept in the user's home directory in the _.anx-session_ file.

### Example Session File

```shell
{
  "tokens": {
    "https://api.appnexus.com/": "token-sdf87sd9fa98f7as987",
    "http://hb.sand-08.adnxs.net/": "token-sfsdg6790s87dfg0sd8"
  },
  "target": "https://hb.sand-08.adnxs.net/",
  "username": "username@appnexus.com"
}
```
